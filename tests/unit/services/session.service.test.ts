import { SessionService } from "../../../src/services/session.service";

describe("SessionService", () => {
  let mockSessionRepo: any;
  let mockTokenUtil: any;
  let mockCache: any;
  let service: SessionService;

  beforeEach(() => {
    mockSessionRepo = {
      getAllSessionbyId: jest.fn(),
      deleteSessionbyUserId: jest.fn(),
      getSession: jest.fn(),
      storeSession: jest.fn(),
      updateSessiontoken: jest.fn(),
    };

    mockTokenUtil = {
      genrateRefeshToken: jest.fn(),
      encryptToken: jest.fn(),
    };

    mockCache = {
      delAllDeviceid: jest.fn(),
    };

    service = new SessionService(mockSessionRepo, mockTokenUtil);
    (service as any).Cache = mockCache; // override private cache instance
  });

  // -------------------------------------------------------------------
  // deleteAll()
  // -------------------------------------------------------------------
  describe("deleteAll", () => {
    it("should delete all sessions and related device IDs", async () => {
      const userId = "user123";
      const mockSessions = [{ id: "sess1" }, { id: "sess2" }];

      mockSessionRepo.getAllSessionbyId.mockResolvedValue(mockSessions);
      mockSessionRepo.deleteSessionbyUserId.mockResolvedValue();
      mockCache.delAllDeviceid.mockResolvedValue();

      await service.deleteAll(userId);

      expect(mockSessionRepo.getAllSessionbyId).toHaveBeenCalledWith(userId);
      expect(mockSessionRepo.deleteSessionbyUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCache.delAllDeviceid).toHaveBeenCalledTimes(2);
      expect(mockCache.delAllDeviceid).toHaveBeenCalledWith("sess1");
      expect(mockCache.delAllDeviceid).toHaveBeenCalledWith("sess2");
    });

    it("should handle no sessions gracefully", async () => {
      const userId = "user123";
      mockSessionRepo.getAllSessionbyId.mockResolvedValue([]);
      mockSessionRepo.deleteSessionbyUserId.mockResolvedValue();

      await service.deleteAll(userId);

      expect(mockSessionRepo.getAllSessionbyId).toHaveBeenCalledWith(userId);
      expect(mockSessionRepo.deleteSessionbyUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockCache.delAllDeviceid).not.toHaveBeenCalled();
    });

    it("should throw if database deletion fails", async () => {
      const userId = "user123";
      mockSessionRepo.getAllSessionbyId.mockResolvedValue([{ id: "sess1" }]);
      mockSessionRepo.deleteSessionbyUserId.mockRejectedValue(
        new Error("DB error")
      );

      await expect(service.deleteAll(userId)).rejects.toThrow("DB error");
    });
  });

  // -------------------------------------------------------------------
  // createSession()
  // -------------------------------------------------------------------
  describe("createSession", () => {
    const userId = "user123";
    const ip = "127.0.0.1";
    const userAgent = "Chrome/Linux";
    const refreshToken = "refresh-token";
    const encryptedToken = "encrypted-token";

    it("should create a new session if none exists", async () => {
      mockSessionRepo.getSession.mockResolvedValue(null);
      mockTokenUtil.genrateRefeshToken.mockReturnValue(refreshToken);
      mockTokenUtil.encryptToken.mockReturnValue(encryptedToken);

      await service.createSession(userId, ip, userAgent);

      expect(mockSessionRepo.getSession).toHaveBeenCalledWith(
        userId,
        ip,
        userAgent
      );
      expect(mockTokenUtil.genrateRefeshToken).toHaveBeenCalledWith(userId);
      expect(mockTokenUtil.encryptToken).toHaveBeenCalledWith(refreshToken);
      expect(mockSessionRepo.storeSession).toHaveBeenCalledWith(
        userId,
        encryptedToken,
        ip,
        userAgent
      );
    });

    it("should update existing session token if session exists", async () => {
      const existingSession = { id: "sess1" };
      mockSessionRepo.getSession.mockResolvedValue(existingSession);
      mockTokenUtil.genrateRefeshToken.mockReturnValue(refreshToken);
      mockTokenUtil.encryptToken.mockReturnValue(encryptedToken);

      await service.createSession(userId, ip, userAgent);

      expect(mockSessionRepo.updateSessiontoken).toHaveBeenCalledWith(
        encryptedToken,
        existingSession.id
      );
      expect(mockSessionRepo.storeSession).not.toHaveBeenCalled();
    });

    it("should return the refresh token", async () => {
      mockSessionRepo.getSession.mockResolvedValue(null);
      mockTokenUtil.genrateRefeshToken.mockReturnValue(refreshToken);
      mockTokenUtil.encryptToken.mockReturnValue(encryptedToken);
      mockSessionRepo.storeSession.mockResolvedValue();

      const result = await service.createSession(userId, ip, userAgent);

      expect(result).toEqual({ refreshToken });
    });

    it("should throw if sessionRepo.storeSession fails", async () => {
      mockSessionRepo.getSession.mockResolvedValue(null);
      mockTokenUtil.genrateRefeshToken.mockReturnValue(refreshToken);
      mockTokenUtil.encryptToken.mockReturnValue(encryptedToken);
      mockSessionRepo.storeSession.mockRejectedValue(new Error("DB fail"));

      await expect(
        service.createSession(userId, ip, userAgent)
      ).rejects.toThrow("DB fail");
    });
  });
});
