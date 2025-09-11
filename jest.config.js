export default {

  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.app.json' }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Configure moduleNameMapper for aliases and ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Setup files to run after env initialization
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/testSetup.js'],
};
