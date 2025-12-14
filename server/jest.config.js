export default {
  testEnvironment: 'node',

  testMatch: ['**/src/tests/**/*.test.js'], 

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/swagger.js',
  ],

  coverageDirectory: 'coverage',
  verbose: true,

  // 삭제해도 괜찮
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
