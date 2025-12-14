// Mock Redis client globally with inline factory
jest.mock("../../db/redis-client", () => ({
  redisClient: {
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
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
