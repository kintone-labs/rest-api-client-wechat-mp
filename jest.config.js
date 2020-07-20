module.exports = {
  clearMocks: true,
  rootDir: 'src',
  testPathIgnorePatterns: ['node_modules'],
  testEnvironment: 'node',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@kintone/rest-api-client)/)'],
};
