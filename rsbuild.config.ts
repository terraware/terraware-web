import { defineConfig, loadEnv, rspack } from '@rsbuild/core';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import chokidar from 'chokidar';

const { convertAllLocales } = require('./src/strings/export');

const serverProxy = {
  target: process.env.PUBLIC_TERRAWARE_API,
  secure: false,
  changeOrigin: false,
  xfwd: true,
};

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSass(),
    pluginSvgr({
      mixedImport: true, // Support both default and named imports for SVGs
    }),
    pluginTypeCheck({ enable: isDev }),
    pluginEslint({
      enable: isDev,
      eslintPluginOptions: { configType: 'flat' },
    }),
  ],

  source: {
    // Entry point
    entry: {
      index: './src/index.tsx',
    },
  },

  html: {
    template: './public/index.html',
    favicon: './public/favicon.ico',
  },

  output: {
    // Clean output directory before build
    cleanDistPath: true,
    // Asset prefix (equivalent to PUBLIC_URL)
    assetPrefix: process.env.PUBLIC_URL || '/',
  },

  server: {
    htmlFallback: false,
    historyApiFallback: true,
    proxy: {
      '/admin': serverProxy,
      '/api': serverProxy,
      '/sso': serverProxy,
      '/swagger-ui.html': serverProxy,
      '/swagger-ui': serverProxy,
      '/v3': serverProxy,
    },
    open: true,
  },

  dev: {
    // CSV file watching with page reload
    watchFiles: {
      paths: 'src/strings/csv/*.csv',
      type: 'reload-page',
    },

    // Custom middleware for CSV conversion
    setupMiddlewares: [
      (middlewares) => {
        // CSV conversion function
        const convert = () => convertAllLocales('src/strings/csv', 'src/strings');

        // Watch CSV files and convert on change
        // The "add" event is fired when Chokidar first discovers each file,
        // which will cause JS to be generated as part of server initialization
        chokidar.watch('src/strings/csv/*.csv').on('add', convert).on('change', convert);

        return middlewares;
      },
    ],
  },

  tools: {
    rspack: {
      plugins: [
        // sync-ammo is only needed for playcancas when usePhysics is enabled, but we don't need this and it causes a compilation error, so ignore it
        new rspack.IgnorePlugin({ resourceRegExp: /^sync-ammo$/ }),
      ],
      //     // TODO handle changes in web-components
      //     // Snapshot configuration for @terraware/web-components watching
      //     experiments: {
      //       cache: {
      //         type: 'filesystem',
      //         snapshot: {
      //           // Watch web-components, but not other modules, for changes
      //           managedPaths: [/^(.+?[\\/]node_modules[\\/](?!(@terraware[\\/]web-components))(@.+?[\\/])?.+?)[\\/]/],
      //         },
      //       },
      //     },
    },
  },

  performance: {
    // Enable build cache for faster rebuilds
    buildCache: true,
  },
});
