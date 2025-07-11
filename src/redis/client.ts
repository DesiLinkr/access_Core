import Redis from "ioredis";

export const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis error:", err));
