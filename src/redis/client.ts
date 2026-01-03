import Redis from "ioredis";

export const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",{
maxRetriesPerRequest: null,   // 🔥 REQUIRED for Upstash
  enableReadyCheck: false,      // 🔥 REQUIRED for Upstash
  tls: {},                      // 🔥 REQUIRED (Upstash is TLS-only)
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
  }
);

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis error:", err));
