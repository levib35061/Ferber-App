// Plain-Node Jest config for the network sync test (no React Native preset).
// Run: SYNC_E2E=1 npx jest -c jest.e2e.config.js
module.exports = {
  testEnvironment: 'node',
  forceExit: true, // realtime sockets stay open
  testMatch: ['**/__tests__/**/*.e2e.test.ts'],
  transform: { '^.+\\.[jt]sx?$': ['babel-jest', { presets: [require('path').join(__dirname, 'node_modules/expo/node_modules/babel-preset-expo')] }] },
  transformIgnorePatterns: ['/node_modules/'],
};
