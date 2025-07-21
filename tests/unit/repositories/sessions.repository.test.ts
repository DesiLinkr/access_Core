import { SessionsRepository } from "../../../src/repositories/sessions.repository";
import { Pool } from "pg";

describe("SessionsRepository", () => {
  let mockQuery: jest.Mock;
  let mockPool: Partial<Pool>;
  let sessionsRepo: SessionsRepository;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockPool = { query: mockQuery };
    sessionsRepo = new SessionsRepository(mockPool as Pool);
  });

  it("should call the correct SQL and params to insert a new session", async () => {
    mockQuery.mockResolvedValueOnce({});
    await sessionsRepo.storeSession(
      "user123",
      "encryptedToken",
      "192.168.1.1",
      "Mozilla"
    );
    expect(mockQuery).toHaveBeenCalledWith(
      `INSERT INTO sessions ( user_id ,refeshtoken,ip,user_agent) values($1, $2, $3,$4)`,
      ["user123", "encryptedToken", "192.168.1.1", "Mozilla"]
    );
  });

  it("should return the session object if a matching session exists", async () => {
    const mockSession = { user_id: "user123", refeshtoken: "token" };
    mockQuery.mockResolvedValueOnce({ rows: [mockSession] });
    const session = await sessionsRepo.getSession(
      "user123",
      "192.168.1.1",
      "Mozilla"
    );
    expect(mockQuery).toHaveBeenCalledWith(
      `SELECT * FROM sessions WHERE user_id = $1 AND ip=$2 AND user_agent=$3  AND expires_at > NOW() LIMIT 1`,
      ["user123", "192.168.1.1", "Mozilla"]
    );
    expect(session).toEqual(mockSession);
  });

  it("should return null if no matching session is found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const session = await sessionsRepo.getSession("user123", "ip", "agent");
    expect(session).toBeNull();
  });

  it("should call the correct SQL and params to update a session's refresh token", async () => {
    mockQuery.mockResolvedValueOnce({});
    await sessionsRepo.updateSessiontoken("newToken", "user123");
    expect(mockQuery).toHaveBeenCalledWith(
      `UPDATE SET refeshtoken = $1 WHERE  user_id =$2`,
      ["newToken", "user123"]
    );
  });

  it("should call the correct SQL and params to delete sessions older than 7 days", async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    mockQuery.mockResolvedValueOnce({});
    await sessionsRepo.removeExpiredsessions("user123");
    expect(mockQuery).toHaveBeenCalledWith(
      `DELETE FROM sessions WHERE id= $1 AND expires_at=$2`,
      ["user123", sevenDaysAgo.getTime()]
    );
  });
});
