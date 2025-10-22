import pool from "../db/client";
import { CREATE_SESSIONS_TABLE } from "./models/sessionsModel";

(async () => {
  try {
    await pool.query(CREATE_SESSIONS_TABLE);
    console.log("✅ Users table created");
  } catch (error) {
    console.error("❌ Error creating table", error);
  }
})();
