import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error("Redis connection failed after 3 retries");
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });
}

export const redis = globalForRedis.redis ?? createRedisConnection();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export default redis;
