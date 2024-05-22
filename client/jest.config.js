module.exports = {
setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
testEnvironment: 'jest-environment-jsdom',
moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
},
transform: {
    '^.+\\.jsx?$': 'babel-jest',
},
transformIgnorePatterns: [
    '/node_modules/(?!(antd|rc-picker)/)',
  ]
};