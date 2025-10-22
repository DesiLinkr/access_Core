import { SessionsHandlers } from "../../../../src/grpc/handlers/sessions.handler";
import { SessionService } from "../../../../src/services/session.service";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
  CreateSessionRequest,
  CreateSessionResponse,
} from "../../../../src/grpc/generated/access";

jest.mock("../../../../src/services/session.service");

describe("SessionsHandlers", () => {
  let handlers: SessionsHandlers;
  let mockSessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    mockSessionService = new (SessionService as jest.Mock)();
    // Manually mock the createSession method
    mockSessionService.createSession = jest.fn();
    // Inject the mock into the handler
    handlers = new SessionsHandlers();
    // @ts-ignore: override private property for testing
    handlers.SessionService = mockSessionService;
  });

  it("should call createSession and callback with refreshToken on success", async () => {
    const call = {
      request: { userId: "uid", ip: "ip", userAgent: "agent" },
    } as ServerUnaryCall<CreateSessionRequest, CreateSessionResponse>;
    const callback = jest.fn();
    mockSessionService.createSession.mockResolvedValueOnce({
      refreshToken: "token",
    });

    await handlers.genrateSession(call, callback);

    expect(mockSessionService.createSession).toHaveBeenCalledWith(
      "uid",
      "ip",
      "agent"
    );
    expect(callback).toHaveBeenCalledWith(null, { refreshToken: "token" });
  });

  it("should callback with error if createSession throws", async () => {
    const call = {
      request: { userId: "uid", ip: "ip", userAgent: "agent" },
    } as ServerUnaryCall<CreateSessionRequest, CreateSessionResponse>;
    const callback = jest.fn();
    const error = new Error("fail");
    mockSessionService.createSession.mockRejectedValueOnce(error);

    await handlers.genrateSession(call, callback);

    expect(callback).toHaveBeenCalledWith(error, null);
  });
});
