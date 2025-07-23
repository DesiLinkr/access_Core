import { SessionService } from "../../../src/services/session.service";
import { SessionsRepository } from "../../../src/repositories/sessions.repository";
import { TokenUtil } from "../../../src/utils/token.util";

// Mock the dependencies
jest.mock("../../../src/repositories/sessions.repository");
jest.mock("../../../src/utils/token.util");

describe("SessionService", () => {
  let sessionService: SessionService;
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
    mockTokenUtil.genrateRefeshToken = jest.fn();
    mockTokenUtil.encryptToken = jest.fn();
    mockTokenUtil.verifyRefreshToken = jest.fn();
    mockTokenUtil.compareTokens = jest.fn();

    // Inject BOTH mocked dependencies
    sessionService = new SessionService(mockSessionRepo, mockTokenUtil);
  });

  // createSession tests (already present)
  it("should create a new session if one does not exist", async () => {
    mockSessionRepo.getSession.mockResolvedValueOnce(null);
    mockTokenUtil.genrateRefeshToken.mockReturnValue("new-refresh-token");
    mockTokenUtil.encryptToken.mockReturnValue("encrypted-token");

    const result = await sessionService.createSession("uid", "ip", "agent");

    expect(mockSessionRepo.getSession).toHaveBeenCalledWith(
      "uid",
      "ip",
      "agent"
    );
    expect(mockSessionRepo.storeSession).toHaveBeenCalledWith(
      "uid",
      "encrypted-token",
      "ip",
      "agent"
    );
    expect(result.refreshToken).toBe("new-refresh-token");
  });

  it("should update an existing session if one exists", async () => {
    mockSessionRepo.getSession.mockResolvedValueOnce({ id: "session-id" });
    mockTokenUtil.genrateRefeshToken.mockReturnValue("updated-refresh-token");
    mockTokenUtil.encryptToken.mockReturnValue("updated-encrypted-token");

    const result = await sessionService.createSession("uid", "ip", "agent");

    expect(mockSessionRepo.getSession).toHaveBeenCalledWith(
      "uid",
      "ip",
      "agent"
    );
    expect(mockSessionRepo.updateSessiontoken).toHaveBeenCalledWith(
      "updated-encrypted-token",
      "session-id"
    );
    expect(result.refreshToken).toBe("updated-refresh-token");
  });

  // verify() tests
  it("should return status 200 for valid token and session", async () => {
    mockTokenUtil.verifyRefreshToken.mockReturnValue(mockDecodedToken);
    mockSessionRepo.getSession.mockResolvedValueOnce({
      refeshtoken: "encrypted-db-token",
    });
    mockTokenUtil.compareTokens.mockReturnValue(true);

    const result = await sessionService.verify(refreshToken, ip, userAgent);

    expect(result).toEqual({ status: 200 });
    expect(mockTokenUtil.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockSessionRepo.getSession).toHaveBeenCalledWith(
      "uid",
      ip,
      userAgent
    );
    expect(mockTokenUtil.compareTokens).toHaveBeenCalledWith(
      "encrypted-db-token",
      refreshToken
    );
  });

  it("should return status 400 for missing or invalid refresh token", async () => {
    mockTokenUtil.verifyRefreshToken.mockReturnValue(null);

    const result = await sessionService.verify(refreshToken, ip, userAgent);

    expect(result).toEqual({
      error: "Missing or invalid refresh token",
      status: 400,
    });

    expect(mockSessionRepo.getSession).not.toHaveBeenCalled();
    expect(mockTokenUtil.compareTokens).not.toHaveBeenCalled();
  });

  it("should return status 403 for session mismatch or expired", async () => {
    mockTokenUtil.verifyRefreshToken.mockReturnValue(mockDecodedToken);
    mockSessionRepo.getSession.mockResolvedValueOnce(null);

    const result = await sessionService.verify(refreshToken, ip, userAgent);

    expect(result).toEqual({
      error: "Session does not match with current device OR expired",
      status: 403,
    });

    expect(mockTokenUtil.compareTokens).not.toHaveBeenCalled();
  });

  it("should return status 401 for mismatched tokens", async () => {
    mockTokenUtil.verifyRefreshToken.mockReturnValue(mockDecodedToken);
    mockSessionRepo.getSession.mockResolvedValueOnce({
      refeshtoken: "encrypted-db-token",
    });
    mockTokenUtil.compareTokens.mockReturnValue(false);

    const result = await sessionService.verify(refreshToken, ip, userAgent);

    expect(result).toEqual({
      error: "Invalid session",
      status: 401,
    });

    expect(mockTokenUtil.compareTokens).toHaveBeenCalledWith(
      "encrypted-db-token",
      refreshToken
    );
  });
});
