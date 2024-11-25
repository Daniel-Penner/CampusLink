module.exports = {
  testTimeout: 10000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'], // Match test files
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
