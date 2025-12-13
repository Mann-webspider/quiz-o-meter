const redis = require("redis");

// Get Redis configuration from environment or use defaults
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

console.log(`Redis config: ${REDIS_HOST}:${REDIS_PORT}`);

// Redis client configuration
const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  enableOfflineQueue: true,
  reconnectStrategy: (retries) => {
    if (retries > 10) {
      console.error("Redis: Too many reconnection attempts, stopping...");
      return new Error("Redis reconnection failed");
    }
    const delay = Math.min(retries * 100, 3000);
    console.log(`Redis: Reconnecting in ${delay}ms...`);
    return delay;
  },
});

// Error handling
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis: Connecting...");
});

redisClient.on("ready", () => {
  console.log("✓ Redis: Connected and ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis: Reconnecting...");
});

redisClient.on("end", () => {
  console.log("Redis: Connection closed");
});

// Initialize connection
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log("✓ Redis connected successfully");
    return redisClient;
  } catch (err) {
    console.error("Redis connection error:", err);
    throw err;
  }
};

// Helper functions for common operations
const redisHelpers = {
  // Set with expiry (TTL in seconds)
  async setWithExpiry(key, value, ttl = 3600) {
    return await redisClient.setEx(key, ttl, JSON.stringify(value));
  },

  // Get and parse JSON
  async getJSON(key) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Set JSON data
  async setJSON(key, value) {
    return await redisClient.set(key, JSON.stringify(value));
  },

  // Check if key exists
  async exists(key) {
    return await redisClient.exists(key);
  },

  // Delete key(s)
  async delete(...keys) {
    if (keys.length === 0) return 0;
    return await redisClient.del(keys);
  },

  // Get all keys matching pattern
  async getKeys(pattern) {
    return await redisClient.keys(pattern);
  },

  // Atomic increment
  async increment(key) {
    return await redisClient.incr(key);
  },

  // Generate unique ID
  async generateId(prefix) {
    const id = await redisClient.incr(`${prefix}:id:counter`);
    return `${prefix}_${id}_${Date.now()}`;
  },
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nClosing Redis connection...");
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nClosing Redis connection...");
  await redisClient.quit();
  process.exit(0);
});

module.exports = {
  redisClient,
  connectRedis,
  redisHelpers,
};
