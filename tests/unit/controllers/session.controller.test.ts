import { Request, Response } from "express";
import { SessionController } from "../../../src/controllers/session.controller";
import { SessionService } from "../../../src/services/session.service";

describe("verifySession controller", () => {
  let controller: SessionController;
  let sessionServiceMock: jest.Mocked<SessionService>;

  beforeEach(() => {
    sessionServiceMock = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    controller = new SessionController(sessionServiceMock);
  });

  it("should return 400 if refresh token is missing", async () => {
    const req = { cookies: {} } as Partial<Request> as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.verifySession(req, res);

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

    await controller.verifySession(req, res);

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

    sessionServiceMock.verify.mockRejectedValue(new Error("Mock error"));

    await controller.verifySession(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Internal server error");
  });

  it("should return result from sessionService.verify", async () => {
    const req = {
      cookies: { refresh_token: "mock-refresh-token" },
      clientInfo: { ip: "mock-ip", user_agent: "mock-user-agent" },
    } as unknown as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockResult = { status: 200 };
    sessionServiceMock.verify.mockResolvedValue(mockResult);

    await controller.verifySession(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should return error from sessionService.verify if result contains 'error'", async () => {
    const req = {
      cookies: { refresh_token: "mock-refresh-token" },
      clientInfo: { ip: "mock-ip", user_agent: "mock-user-agent" },
    } as unknown as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockResult = { error: "Invalid token", status: 401 };
    sessionServiceMock.verify.mockResolvedValue(mockResult);

    await controller.verifySession(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });
});
