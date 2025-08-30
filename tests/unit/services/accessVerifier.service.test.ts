// tests/unit/core/accessVerifier.test.ts
import { AccessVerifier } from "../../../src/services/accessVerifier.service";
import { TokenUtil } from "../../../src/utils/token.util";
import { deviceId } from "../../../src/cache/deviceId.cache";
jest.mock("../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock("../../../src/utils/token.util");
jest.mock("../../../src/cache/deviceId.cache");

describe("AccessVerifier", () => {
  let verifier: AccessVerifier;
  let tokenUtilMock: jest.Mocked<TokenUtil>;
  let deviceIdMock: jest.Mocked<deviceId>;

  beforeEach(() => {
    tokenUtilMock = {
      verifyAccessToken: jest.fn(),
      generateDeviceId: jest.fn(),
    } as unknown as jest.Mocked<TokenUtil>;

    deviceIdMock = {
      getDeviceid: jest.fn(),
    } as unknown as jest.Mocked<deviceId>;

    // Make constructor return our mocks
    (TokenUtil as jest.Mock).mockReturnValue(tokenUtilMock);
    (deviceId as jest.Mock).mockReturnValue(deviceIdMock);

    verifier = new AccessVerifier();
  });

  it("should fail when token is missing", async () => {
    const result = await verifier.verify("", "127.0.0.1", "UA");
    expect(result).toEqual({
      valid: false,
      status: 401,
      error: "Access token missing",
    });
  });

  it("should fail when ip or userAgent missing", async () => {
    const result = await verifier.verify("token", "", "");
    expect(result).toEqual({
      valid: false,
      status: 401,
      error: "Missing IP address or User-Agent",
    });
  });

  it("should fail when token is invalid", async () => {
    tokenUtilMock.verifyAccessToken.mockReturnValue(null);

    const result = await verifier.verify("badtoken", "127.0.0.1", "UA");
    expect(result).toEqual({
      valid: false,
      status: 401,
      error: "Invalid or expired token",
    });
  });

  it("should fail when deviceId mismatch", async () => {
    tokenUtilMock.verifyAccessToken.mockReturnValue({
      user_id: "123",
      session_id: "abc",
    });
    deviceIdMock.getDeviceid.mockResolvedValue("deviceA");
    tokenUtilMock.generateDeviceId.mockReturnValue("deviceB");

    const result = await verifier.verify("token", "127.0.0.1", "UA");
    expect(result).toEqual({
      valid: false,
      status: 403,
      error: "Session does not match with current device OR expired",
    });
  });

  it("should succeed when token + device match", async () => {
    tokenUtilMock.verifyAccessToken.mockReturnValue({
      user_id: "123",
      session_id: "abc",
    });
    deviceIdMock.getDeviceid.mockResolvedValue("deviceX");
    tokenUtilMock.generateDeviceId.mockReturnValue("deviceX");

    const result = await verifier.verify("token", "127.0.0.1", "UA");
    expect(result).toEqual({
      valid: true,
      status: 200,
      userId: "123",
      sessionId: "abc",
    });
  });
});
