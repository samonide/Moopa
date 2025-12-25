import { Redis } from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

const REDIS_URL: string | undefined = process.env.REDIS_URL;

let redis: Redis | null = null;
let rateLimiterRedis: RateLimiterRedis | null = null;
let rateLimitStrict: RateLimiterRedis | null = null;
let rateSuperStrict: RateLimiterRedis | null = null;

if (REDIS_URL && REDIS_URL.trim().length > 0) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true, // Don't connect immediately
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.warn("Redis connection failed after 3 retries. Disabling Redis.");
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      },
    });

    redis.on("error", (err: Error) => {
      // Silently handle errors when Redis is not available
      if (process.env.NODE_ENV === "development") {
        console.error("Redis error:", err.message);
      }
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully");
    });

    // Try to connect
    redis.connect().catch((err) => {
      console.error("Failed to connect to Redis:", err.message);
      redis = null; // Set to null if connection fails
    });

    const opt = {
      storeClient: redis,
      keyPrefix: "rateLimit",
      points: 50,
      duration: 1,
    };

    const optStrict = {
      storeClient: redis,
      keyPrefix: "rateLimitStrict",
      points: 20,
      duration: 1,
    };

    const optSuperStrict = {
      storeClient: redis,
      keyPrefix: "rateLimitSuperStrict",
      points: 3,
      // duration 10 minutes
      duration: 10 * 60,
      blockDuration: 10 * 60,
    };

    rateLimiterRedis = new RateLimiterRedis(opt);
    rateLimitStrict = new RateLimiterRedis(optStrict);
    rateSuperStrict = new RateLimiterRedis(optSuperStrict);
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    redis = null;
  }
} else {
  if (process.env.NODE_ENV === "development") {
    console.warn("REDIS_URL is not defined. Redis caching will be disabled.");
  }
}

export { redis, rateLimiterRedis, rateLimitStrict, rateSuperStrict };
