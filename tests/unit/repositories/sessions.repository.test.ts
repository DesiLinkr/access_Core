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

  it("should insert a new session with correct SQL and parameters", async () => {
    mockQuery.mockResolvedValueOnce({});
    await sessionsRepo.storeSession(
      "user123",
      "encryptedToken",
      "1.1.1.1",
      "UA"
    );

    expect(mockQuery).toHaveBeenCalledWith(
      `INSERT INTO sessions ( user_id ,refeshtoken,ip,user_agent) values($1, $2, $3,$4)`,
      ["user123", "encryptedToken", "1.1.1.1", "UA"]
    );
  });

  it("should return all sessions for a given user", async () => {
    const mockRows = [{ ip: "1.1.1.1", user_agent: "UA" }];
    mockQuery.mockResolvedValueOnce({ rows: mockRows });

    const result = await sessionsRepo.getAllSessionbyId("user123");

    expect(mockQuery).toHaveBeenCalledWith(
      `SELECT ip,user_agent,created_at AS login_time,expires_at  FROM sessions WHERE user_id = $1 `,
      ["user123"]
    );
    expect(result).toEqual(mockRows);
  });

  it("should delete sessions by user_id", async () => {
    mockQuery.mockResolvedValueOnce({});
    await sessionsRepo.deleteSessionbyUserId("user123");

    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM sessions WHERE user_id = $1  ",
      ["user123"]
    );
  });

  it("should return all session IDs for a user", async () => {
    const mockRows = [{ id: "sess1" }, { id: "sess2" }];
    mockQuery.mockResolvedValueOnce({ rows: mockRows });

    const result = await sessionsRepo.getAllSessionIDbyId("user123");

    expect(mockQuery).toHaveBeenCalledWith(
      `SELECT id AS id  FROM sessions WHERE user_id = $1 `,
      ["user123"]
    );
    expect(result).toEqual(mockRows);
  });

  it("should return a session if found", async () => {
    const mockSession = { id: "sess1", user_id: "user123" };
    mockQuery.mockResolvedValueOnce({ rows: [mockSession] });

    const session = await sessionsRepo.getSession("user123", "ip", "UA");

    expect(mockQuery).toHaveBeenCalledWith(
      `SELECT * FROM sessions WHERE user_id = $1 AND ip=$2 AND user_agent=$3  AND expires_at > NOW() LIMIT 1`,
      ["user123", "ip", "UA"]
    );
    expect(session).toEqual(mockSession);
  });

  it("should return null if session not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await sessionsRepo.getSession("user123", "ip", "UA");
    expect(result).toBeNull();
  });

  it("should update session token correctly", async () => {
    mockQuery.mockResolvedValueOnce({});
    await sessionsRepo.updateSessiontoken("newEncToken", "sess1");

    expect(mockQuery).toHaveBeenCalledWith(
      `UPDATE sessions SET refeshtoken = $1 WHERE  id = $2`,
      ["newEncToken", "sess1"]
    );
  });

  it("should delete expired sessions correctly", async () => {
    mockQuery.mockResolvedValueOnce({});
    const time = new Date(Date.now() - 7 * 86400000).getTime() / 1000;

    await sessionsRepo.removeExpiredsessions();

    expect(mockQuery).toHaveBeenCalledWith(
      `DELETE FROM sessions WHERE  expires_at <= to_timestamp($1)`,
      [time]
    );
  });

  it("should return session by ID", async () => {
    const mockSession = { id: "sess1", user_id: "user123" };
    mockQuery.mockResolvedValueOnce({ rows: [mockSession] });

    const result = await sessionsRepo.getSessionbyId("sess1");

    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * From sessions WHERE id=$1",
      ["sess1"]
    );
    expect(result).toEqual(mockSession);
  });

  it("should return null if session by ID not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await sessionsRepo.getSessionbyId("sess2");
    expect(result).toBeNull();
  });
});
