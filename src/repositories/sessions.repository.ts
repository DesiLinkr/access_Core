import { Pool } from "pg";
import dbClient from "../db/client";

export class SessionsRepository {
  private database: Pool;
  constructor(DbClient?: Pool) {
    this.database = DbClient ?? dbClient;
  }

  public storeSession = async (
    user_id: string,
    encryptedToken: string,
    ip: string,
    user_agent: string
  ) => {
    return await this.database.query(
      `INSERT INTO sessions ( user_id ,refeshtoken,ip,user_agent) values($1, $2, $3,$4)`,
      [user_id, encryptedToken, ip, user_agent]
    );
  };

  public getAllSessionbyId = async (user_id: string) => {
    const result = await this.database.query(
      `SELECT ip,user_agent,created_at AS login_time,expires_at  FROM sessions WHERE user_id = $1 `,
      [user_id]
    );
    return result.rows || null;
  };

  public getSession = async (
    user_id: string,
    ip: string,
    user_agent: string
  ) => {
    const result = await this.database.query(
      `SELECT * FROM sessions WHERE user_id = $1 AND ip=$2 AND user_agent=$3  AND expires_at > NOW() LIMIT 1`,
      [user_id, ip, user_agent]
    );
    return result.rows[0] || null;
  };

  public updateSessiontoken = async (newEncryptedtoken: string, id: string) => {
    return await this.database.query(
      `UPDATE sessions SET refeshtoken = $1 WHERE  id = $2`,
      [newEncryptedtoken, id]
    );
  };

  public removeExpiredsessions = async (user_id: string) => {
    return await this.database.query(
      `DELETE FROM sessions WHERE id= $1 AND expires_at=$2`,
      [user_id, new Date(Date.now() - 7 * 86400000).getTime()]
    );
  };

  public getSessionbyId = async (sessionId: string) => {
    const result = await this.database.query(
      "SELECT * From sessions WHERE id=$1",
      [sessionId]
    );
    return result.rows[0] || null;
  };
}
