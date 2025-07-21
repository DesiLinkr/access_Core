import { TokenUtil } from "../../../src/utils/token.util";

describe("TokenUtil", () => {
  const tokenUtil = new TokenUtil();
  const userId = "test-user-id";

  it("should generate and verify a refresh token", () => {
    const refreshToken = tokenUtil.genrateRefeshToken(userId);
    expect(typeof refreshToken).toBe("string");
    const payload = tokenUtil.verifyRefreshToken(refreshToken) as any;
    expect(payload.user_id).toBe(userId);
  });

  it("should generate and verify an access token", () => {
    const accessToken = tokenUtil.genrateAccessToken(userId);
    expect(typeof accessToken).toBe("string");
    const payload = tokenUtil.verifyAccessToken(accessToken) as any;
    expect(payload.user_id).toBe(userId);
  });

  it("should decode a token", () => {
    const accessToken = tokenUtil.genrateAccessToken(userId);
    const decoded = tokenUtil.decode(accessToken) as any;
    expect(decoded.user_id).toBe(userId);
  });

  it("should encrypt a token", () => {
    const token = "sometoken";
    const encrypted = tokenUtil.encryptToken(token);
    expect(typeof encrypted).toBe("string");
    expect(encrypted).not.toBe(token);
    // SHA256 hash is always 64 hex chars
    expect(encrypted).toHaveLength(64);
  });
});
