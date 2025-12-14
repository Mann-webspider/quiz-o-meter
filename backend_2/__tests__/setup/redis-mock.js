// Helper to create mock Redis client (for reference/reuse)
const createMockRedisClient = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  hSet: jest.fn().mockResolvedValue(1),
  hGetAll: jest.fn().mockResolvedValue({}),
  hGet: jest.fn().mockResolvedValue(null),
  sAdd: jest.fn().mockResolvedValue(1),
  sMembers: jest.fn().mockResolvedValue([]),
  keys: jest.fn().mockResolvedValue([]),
  del: jest.fn().mockResolvedValue(1),
  flushDb: jest.fn().mockResolvedValue("OK"),
  publish: jest.fn().mockResolvedValue(1),
  subscribe: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue("OK"),
});

module.exports = { createMockRedisClient };
