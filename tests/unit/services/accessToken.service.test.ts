import { Result } from "pg";
import { SessionsRepository } from "../../../src/repositories/sessions.repository";
import { AccessTokenService } from "../../../src/services/accessToken.service";
import { SessionService } from "../../../src/services/session.service";
import { TokenUtil } from "../../../src/utils/token.util";
jest.mock("../../../src/utils/grpc.util", () => ({
  getUserInfoById: jest.fn(),
}));

import { getUserInfoById } from "../../../src/utils/grpc.util";

(getUserInfoById as jest.Mock).mockResolvedValue({
  id: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
});
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
    mockSessionRepo.getSessionbyId = jest.fn();
    mockTokenUtil.verifyRefreshToken = jest.fn();
    mockTokenUtil.compareTokens = jest.fn();
    mockTokenUtil.genrateAccessToken = jest.fn();
    mockTokenUtil.extractToken = jest.fn();
    mockTokenUtil.verifyAccessToken = jest.fn();
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

  it("should return error 401 Unauthorized if token is missing", async () => {
    const authHeader = "Bearer ";
    const ip = "192.168.1.1";
    const user_agent = "Mozilla/5.0";

    const result = await accessTokenService.getUser(authHeader, ip, user_agent);

    expect(result).toEqual({
      error: "Unauthorized",
      status: 401,
    });
  });

  it("should return error 403 if session does not match current device or is expired", async () => {
    const authHeader = "Bearer valid_token";
    const ip = "192.168.1.1";
    const user_agent = "Mozilla/5.0";
    const decode = { session_id: "valid_session_id" };

    // Mock extractToken and verifyAccessToken behaviors
    mockTokenUtil.extractToken.mockReturnValue("valid_token");
    mockTokenUtil.verifyAccessToken.mockReturnValue(decode);

    // Mock getSessionById to return an invalid session
    mockSessionRepo.getSessionbyId.mockResolvedValue(null as any);

    const result = await accessTokenService.getUser(authHeader, ip, user_agent);

    expect(result).toEqual({
      error: "Session does not match with current device OR expired",
      status: 403,
    });
  });
  it("should return user information if session is valid", async () => {
    const authHeader = "Bearer valid_token";
    const ip = "192.168.1.1";
    const user_agent = "Mozilla/5.0";
    const decode = { session_id: "valid_session_id", user_id: "user123" };
    const mockUser = {
      id: "user123",
      name: "John Doe",
      email: "john.doe@example.com",
    };

    // Mock extractToken and verifyAccessToken behaviors
    mockTokenUtil.extractToken.mockReturnValue("valid_token");
    mockTokenUtil.verifyAccessToken.mockReturnValue(decode);

    // Mock getSessionById to return a valid session
    mockSessionRepo.getSessionbyId.mockResolvedValue({
      refeshtoken: "encrypted-db-token",
      user_id: "user123",
      ip,
      user_agent: userAgent,
    } as any);

    const result = await accessTokenService.getUser(authHeader, ip, user_agent);
    expect(getUserInfoById).toHaveBeenCalledWith({ id: "user123" }); // Ensure getUserInfoById was called with correct user_id
    expect(result).toEqual({
      UserInfo: mockUser,
    });
  });
});
