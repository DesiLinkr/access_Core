import { Result } from "pg";
import { SessionsRepository } from "../../../src/repositories/sessions.repository";
import { AccessService } from "../../../src/services/access.service";
import { SessionService } from "../../../src/services/session.service";
import { TokenUtil } from "../../../src/utils/token.util";

jest.mock("../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

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
  let accessTokenService: AccessService;
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
    accessTokenService = new AccessService(mockSessionRepo, mockTokenUtil);
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

    const result = await accessTokenService.getUser("user123");
    expect(result).toEqual({
      UserInfo: mockUser,
    });
  });
});
