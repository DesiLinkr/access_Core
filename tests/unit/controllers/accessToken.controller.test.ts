import { Request, Response } from "express";
import { AccessTokenController } from "../../../src/controllers/accessToken.controller";
import { AccessTokenService } from "../../../src/services/accessToken.service";

describe("AccessToken controller", () => {
  let controller: AccessTokenController;

  let accessTokenServiceMock: jest.Mocked<AccessTokenService>;

  beforeEach(() => {
    accessTokenServiceMock = {
      generateFromRefresh: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenService>;

    controller = new AccessTokenController(accessTokenServiceMock);
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

    const mockResult = { sessionId: "sisi", access_token: "eiiie" };
    accessTokenServiceMock.generateFromRefresh.mockResolvedValue(mockResult);

    await controller.issueAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });
});
