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

    // Inject BOTH mocked dependencies
    sessionService = new SessionService(mockSessionRepo, mockTokenUtil);
  });

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
});
