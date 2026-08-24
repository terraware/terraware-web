import { defineConfig } from '@rstest/core';
import path from 'path';

export default defineConfig({
  testEnvironment: 'jsdom',
  // Playwright specs use a different `test` global and can't run here. The globs are recursive
  // because copies of the tree show up under agent worktrees and yalc links, and a bare 'playwright'
  // only matches the top-level directory.
  exclude: ['**/playwright/**', '**/.claude/**', '**/.yalc/**', '**/node_modules/**', '**/dist/**'],
  setupFiles: ['./src/setupTests.js'],
  resolve: {
    alias: {
      'react-map-gl/mapbox': path.resolve('./node_modules/react-map-gl/dist/mapbox.cjs'),
    },
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            // Components from @terraware/web-components import their own stylesheets. jsdom does
            // not apply styles, so compiling them would only cost time; load them as inert source
            // instead of letting the JS parser choke on the SCSS.
            test: /\.(css|scss|sass)$/,
            type: 'asset/source',
          },
        ],
      },
    },
  },
  globals: true,
  coverage: {
    reportsDirectory: 'docs/coverage',
  },
});
