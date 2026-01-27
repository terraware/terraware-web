const chokidar = require('chokidar');
const fs = require('fs');
const webpack = require('webpack');
const { whenDev } = require('@craco/craco');
const { convertAllLocales } = require('./src/strings/export');
const CracoEsbuildPlugin = require('craco-esbuild');

module.exports = {
  devServer: (devServerConfig, { paths }) => ({
    ...devServerConfig,

    // https://github.com/facebook/create-react-app/issues/11860#issuecomment-1140417343
    onAfterSetupMiddleware: undefined,
    onBeforeSetupMiddleware: undefined,

    setupMiddlewares: (middlewares, devServer) => {
      // Support hot reloading of edits to strings CSV files by converting them to JS when they
      // change; the JS edits will be picked up by Webpack. The "add" event is fired when Chokidar
      // first discovers each file, which will cause JS to be generated as part of server
      // initialization.
      const convert = () => convertAllLocales('src/strings/csv', 'src/strings');
      chokidar.watch('src/strings/csv/*.csv').on('add', convert).on('change', convert);

      if (fs.existsSync(paths.proxySetup)) {
        require(paths.proxySetup)(devServer.app);
      }

      return middlewares;
    },
  }),
  eslint: {
    enable: false,
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins.push(
        new webpack.IgnorePlugin({
          // sync-ammo is only needed for playcancas when usePhysics is enabled, but we don't need this and it causes a compilation error, so ignore it
          resourceRegExp: /^sync-ammo$/,
        })
      );
      return webpackConfig;
    },
    snapshot: {
      ...whenDev(() => ({
        // Watch web-components, but not other modules, for changes.
        managedPaths: [/^(.+?[\\/]node_modules[\\/](?!(@terraware[\\/]web-components))(@.+?[\\/])?.+?)[\\/]/],
      })),
    },
  },
  plugins: [{ plugin: CracoEsbuildPlugin, options: { esbuildJestOptions: { loaders: { '.tsx': 'tsx' } } } }],
};
