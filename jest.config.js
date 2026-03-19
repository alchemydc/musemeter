export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/testSetup.js'],
};
