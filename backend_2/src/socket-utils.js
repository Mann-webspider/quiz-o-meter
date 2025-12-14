const { redisClient } = require("../db/redis-client");

async function publishUserUpdate(roomId, userData, type = "user-updated") {
  try {
    const channel = `room:${roomId}:updates`;
    const message = JSON.stringify({
      type,
      user: userData,
      timestamp: new Date().toISOString(),
    });

    await redisClient.publish(channel, message);
    console.log(`✓ Published ${type} to ${channel}`);
  } catch (error) {
    console.error("Error publishing user update:", error);
  }
}

module.exports = { publishUserUpdate };
