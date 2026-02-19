import { defineConfig } from '@rstest/core';
import path from 'path';

export default defineConfig({
  testEnvironment: 'jsdom',
  exclude: ['playwright'],
  setupFiles: ['./src/setupTests.js'],
  resolve: {
    alias: {
      'react-map-gl/mapbox': path.resolve('./node_modules/react-map-gl/dist/mapbox.cjs'),
    },
  },
  globals: true,
});
