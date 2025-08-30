import { AccessHandlers } from "../../../../src/grpc/handlers/access.handler";
import { AccessVerifier } from "../../../../src/services/accessVerifier.service";
import { ServerUnaryCall, sendUnaryData, status } from "@grpc/grpc-js";
import {
  AccessVerifierRequest,
  AccessVerifierResponse,
} from "../../../../src/grpc/generated/access";

jest.mock("../../../../src/services/accessVerifier.service");
jest.mock("../../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

describe("AccessHandlers", () => {
  let handlers: AccessHandlers;
  let mockVerifier: jest.Mocked<AccessVerifier>;

  beforeEach(() => {
    mockVerifier = new (AccessVerifier as jest.Mock)();
    mockVerifier.verify = jest.fn();

    handlers = new AccessHandlers();
    // @ts-ignore private override
    handlers.verifier = mockVerifier;
  });

  it("should return valid response when token is valid", async () => {
    const call = {
      request: {
        token: "valid-token",
        ip: "127.0.0.1",
        userAgent: "jest-agent",
      },
    } as unknown as ServerUnaryCall<
      AccessVerifierRequest,
      AccessVerifierResponse
    >;
    const callback = jest.fn();

    mockVerifier.verify.mockResolvedValueOnce({
      valid: true,
      userId: "user123",
      sessionId: "sess123",
      status: 200,
    });

    await handlers.verifyAccessToken(call, callback);

    expect(mockVerifier.verify).toHaveBeenCalledWith(
      "valid-token",
      "127.0.0.1",
      "jest-agent"
    );
    expect(callback).toHaveBeenCalledWith(null, {
      valid: true,
      userId: "user123",
      sessionId: "sess123",
      status: 200,
      error: "",
    });
  });

  it("should return invalid response when token is invalid", async () => {
    const call = {
      request: {
        token: "invalid-token",
        ip: "127.0.0.1",
        userAgent: "jest-agent",
      },
    } as unknown as ServerUnaryCall<
      AccessVerifierRequest,
      AccessVerifierResponse
    >;
    const callback = jest.fn();

    mockVerifier.verify.mockResolvedValueOnce({
      valid: false,
      status: 401,
      error: "Invalid token",
    });

    await handlers.verifyAccessToken(call, callback);

    expect(mockVerifier.verify).toHaveBeenCalledWith(
      "invalid-token",
      "127.0.0.1",
      "jest-agent"
    );
    expect(callback).toHaveBeenCalledWith(null, {
      valid: false,
      userId: "",
      sessionId: "",
      status: 401,
      error: "Invalid token",
    });
  });

  it("should callback with UNAUTHENTICATED if service throws", async () => {
    const call = {
      request: { token: "bad-token", ip: "127.0.0.1", userAgent: "jest-agent" },
    } as unknown as ServerUnaryCall<
      AccessVerifierRequest,
      AccessVerifierResponse
    >;
    const callback = jest.fn();

    const error = new Error("boom");
    mockVerifier.verify.mockRejectedValueOnce(error);

    await handlers.verifyAccessToken(call, callback);

    expect(callback).toHaveBeenCalledWith(error, null);
  });
});
