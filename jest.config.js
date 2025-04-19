export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {},
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Configure moduleNameMapper for aliases and ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Add globals needed by tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  // Setup files to run after env initialization
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/testSetup.js'],
};
