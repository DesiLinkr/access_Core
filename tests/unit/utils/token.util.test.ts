import { TokenUtil } from "../../../src/utils/token.util";

describe("TokenUtil", () => {
  const tokenUtil = new TokenUtil();
  const userId = "test-user-id";
  const session_id = "1";

  it("should generate and verify a refresh token", () => {
    const refreshToken = tokenUtil.genrateRefeshToken(userId);
    expect(typeof refreshToken).toBe("string");
    const payload = tokenUtil.verifyRefreshToken(refreshToken) as any;
    expect(payload.user_id).toBe(userId);
  });

  it("should generate and verify an access token", () => {
    const accessToken = tokenUtil.genrateAccessToken(userId, session_id);
    expect(typeof accessToken).toBe("string");
    const payload = tokenUtil.verifyAccessToken(accessToken) as any;
    expect(payload.user_id).toBe(userId);
  });

  it("should return true when encrypted token matches hashed refresh token", () => {
    const refreshToken = "my_refresh_token";
    const encryptedToken = tokenUtil.encryptToken(refreshToken); // simulate stored encrypted token

    const result = tokenUtil.compareTokens(encryptedToken, refreshToken);
    expect(result).toBe(true);
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
