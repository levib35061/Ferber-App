// Plain-Node Jest config for the network sync test (no React Native preset).
// Run: SYNC_E2E=1 npx jest -c jest.e2e.config.js
module.exports = {
  testEnvironment: 'node',
  globals: { __DEV__: true },
  forceExit: true, // realtime sockets stay open
  testMatch: ['**/__tests__/**/*.e2e.test.ts'],
  transform: { '^.+\\.[jt]sx?$': ['babel-jest', { presets: [require.resolve('babel-preset-expo', { paths: [require.resolve('expo/package.json')] })] }] },
  transformIgnorePatterns: ['/node_modules/(?!expo/virtual/)'],
};
