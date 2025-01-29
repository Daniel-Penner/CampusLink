const path = require('path');

module.exports = {
  testTimeout: 10000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'], // Match test files
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: [path.resolve(__dirname, './jest.setup.js')], // Add this line
};
