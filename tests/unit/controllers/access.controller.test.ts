import { Request, Response } from "express";
import { AccessController } from "../../../src/controllers/access.controller";
import { AccessService } from "../../../src/services/access.service";
jest.mock("../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

describe("AccessToken controller", () => {
  let controller: AccessController;

  let accessTokenServiceMock: jest.Mocked<AccessService>;

  beforeEach(() => {
    accessTokenServiceMock = {
      generateFromRefresh: jest.fn(),
      getUser: jest.fn(),
      getHistory: jest.fn(),
    } as unknown as jest.Mocked<AccessService>;

    controller = new AccessController(accessTokenServiceMock);
  });
  it("should return 400 if refresh token is missing", async () => {
    const req = { cookies: {} } as Partial<Request> as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.issueAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "bad request" });
  });

  it("should return 400 if clientInfo is missing", async () => {
    const req = {
      cookies: { refresh_token: "mock-refresh-token" },
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.issueAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "bad request" });
  });

  it("should return 500 on internal server error", async () => {
    const req = {
      cookies: { refresh_token: "mock-refresh-token" },
      clientInfo: { ip: "mock-ip", user_agent: "mock-user-agent" },
    } as unknown as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    accessTokenServiceMock.generateFromRefresh.mockRejectedValue(
      new Error("Mock error")
    );

    await controller.issueAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });

  it("should return error from  accessTokenService.generateFromRefresh if result contains 'error'", async () => {
    const req = {
      cookies: { refresh_token: "mock-refresh-token" },
      clientInfo: { ip: "mock-ip", user_agent: "mock-user-agent" },
    } as unknown as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockResult = { error: "Invalid token", status: 401 };
    accessTokenServiceMock.generateFromRefresh.mockResolvedValue(mockResult);

    await controller.issueAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("should return result from accessTokenService.generateFromRefresh", async () => {
    const req = {
      cookies: { refresh_token: "mock-refresh-token" },
      clientInfo: { ip: "mock-ip", user_agent: "mock-user-agent" },
    } as unknown as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockResult = { access_token: "eiiie" };
    accessTokenServiceMock.generateFromRefresh.mockResolvedValue(mockResult);

    await controller.issueAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should handle errors and return 500", async () => {
    const req = {
      headers: { authorization: "Bearer token123" },
      clientInfo: {
        ip: "127.0.0.1",
        user_agent: "Mozilla/5.0",
      },
    } as Partial<Request> as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });

  it("should call getUser and return 200 with user info", async () => {
    const req = {
      headers: { authorization: "Bearer token123" },
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockUserData = {
      id: "user123",
      name: "Harsh",
      email: "harsh@example.com",
    };

    // 🧪 Mock service to resolve with user data
    accessTokenServiceMock.getUser.mockResolvedValue(mockUserData as any);

    await controller.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUserData);
  });

  it("should return 200 with sessions if found", async () => {
    const mockSessions = [
      {
        ip: "127.0.0.1",
        user_agent: "jest-agent",
        issuedAt: "2025-08-21T12:00:00Z",
        expiresAt: "2025-08-28T12:00:00Z",
      },
    ];

    const req = {
      headers: { authorization: "Bearer token123" },
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    accessTokenServiceMock.getHistory.mockResolvedValue(mockSessions);

    await controller.acesssHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSessions);
  });

  it("should return empty array if no sessions", async () => {
    const req = {
      headers: { authorization: "Bearer token123" },
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    accessTokenServiceMock.getHistory.mockResolvedValue([]);

    await controller.acesssHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("should return 500 if service throws error", async () => {
    const req = {
      headers: { authorization: "Bearer token123" },
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    accessTokenServiceMock.getHistory.mockRejectedValue(new Error("DB error"));

    await controller.acesssHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });
});
