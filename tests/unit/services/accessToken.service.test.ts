import { Result } from "pg";
import { SessionsRepository } from "../../../src/repositories/sessions.repository";
import { AccessTokenService } from "../../../src/services/accessToken.service";
import { SessionService } from "../../../src/services/session.service";
import { TokenUtil } from "../../../src/utils/token.util";
const refresh_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmEyZGE0MDYtNTE4YS00NjY3LThiZDgtZTE0NmI5YmQxMTU4IiwiaWF0IjoxNzUzMjU1OTU4fQ.3_eGmQeq65LUHO4N-REQgAbBNvPIntNgy-9FJuk0hto";

describe("AccessTokenService", () => {
  let accessTokenService: AccessTokenService;
  let mockSessionRepo: jest.Mocked<SessionsRepository>;
  let mockTokenUtil: jest.Mocked<TokenUtil>;

  const mockDecodedToken = { user_id: "uid" };
  const refreshToken = "sample.refresh.token";
  const ip = "127.0.0.1";
  const userAgent = "Mozilla/5.0";

  beforeEach(() => {
    // Create new mocked instances for each test
    mockSessionRepo = new (SessionsRepository as jest.Mock)();
    mockTokenUtil = new (TokenUtil as jest.Mock)();

    // Manually mock the methods
    mockSessionRepo.getSession = jest.fn();
    mockSessionRepo.storeSession = jest.fn();
    mockSessionRepo.updateSessiontoken = jest.fn();
    mockTokenUtil.verifyRefreshToken = jest.fn();
    mockTokenUtil.compareTokens = jest.fn();
    mockTokenUtil.genrateAccessToken = jest.fn();
    // Inject BOTH mocked dependencies
    accessTokenService = new AccessTokenService(mockSessionRepo, mockTokenUtil);
  });

  it("should return status 400 for missing or invalid refresh token", async () => {
    const result = await accessTokenService.generateFromRefresh(
      refreshToken + "119",
      ip,
      userAgent
    );

    expect(result).toEqual({
      error: "Missing or invalid refresh token",
      status: 400,
    });
  });
  it("should return status 403 for session mismatch or expired", async () => {
    mockTokenUtil.verifyRefreshToken.mockReturnValue(mockDecodedToken);
    mockSessionRepo.getSession.mockResolvedValueOnce(null);
    const result = await accessTokenService.generateFromRefresh(
      refreshToken,
      ip,
      userAgent
    );

    expect(result).toEqual({
      error: "Session does not match with current device OR expired",
      status: 403,
    });
  });

  it("should return access_token  for valid token and session", async () => {
    mockTokenUtil.verifyRefreshToken.mockReturnValue(mockDecodedToken);
    mockSessionRepo.getSession.mockResolvedValueOnce({
      refeshtoken: "encrypted-db-token",
    });
    mockTokenUtil.genrateAccessToken.mockReturnValue("access_token");
    mockTokenUtil.compareTokens.mockReturnValue(true);
    const result = await accessTokenService.generateFromRefresh(
      refreshToken,
      ip,
      userAgent
    );
    expect(result).toEqual({ access_token: "access_token" });
  });
});
