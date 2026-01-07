module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['playwright'],
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    '^react-localization$': '<rootDir>/node_modules/react-localization/lib/react-localization.umd.js',
    'react-map-gl/mapbox': '<rootDir>/node_modules/react-map-gl/dist/mapbox.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
