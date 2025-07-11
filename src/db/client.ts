import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PGHOST,
  port: +process.env.PGPORT!,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});
pool.on("connect", () => {
  console.log("✅ PostgreSQL pool connected successfully.");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err);
});

export default pool;
