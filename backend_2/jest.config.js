module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 10000,
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/test-helpers.js"],
  collectCoverageFrom: [
    "routes/**/*.js",
    "src/**/*.js",
    "db/**/*.js",
    "!**/node_modules/**",
  ],
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true,

  // Transform uuid and other ESM packages
  transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],

  // Use babel-jest to transform ESM modules
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
