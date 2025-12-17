import { Result } from "pg";
import { SessionsRepository } from "../../../src/repositories/sessions.repository";
import { AccessService } from "../../../src/services/access.service";
import { SessionService } from "../../../src/services/session.service";
import { TokenUtil } from "../../../src/utils/token.util";
import pool from "../../../src/db/client";
beforeEach(() => {
  jest.clearAllMocks();
});
jest.mock("../../../src/db/client");

jest.mock("../../../src/redis/client", () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

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

  it("should return empty array when no sessions exist", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const result = await accessTokenService.getHistory("user-123");
    expect(result).toEqual([]);
  });

  it("should return sessions when available", async () => {
    const mockRows = [
      {
        ip: "127.0.0.1",
        user_agent: "jest-agent",
        issuedAt: "2025-08-21T12:00:00Z",
        expiresAt: "2025-08-28T12:00:00Z",
      },
    ];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const result = await accessTokenService.getHistory("user-456");

    expect(result).toEqual(mockRows);
    expect(result[0]).toHaveProperty("ip", "127.0.0.1");
    expect(result[0]).toHaveProperty("user_agent", "jest-agent");
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("should throw error if DB query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    await expect(accessTokenService.getHistory("user-789")).rejects.toThrow(
      "DB error"
    );
  });
});
