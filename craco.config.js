const chokidar = require('chokidar');
const { convertCsvFile } = require('./src/strings/export');
const { whenDev } = require('@craco/craco');

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, _) => {
      // Support hot reloading of edits to strings CSV files by converting them to JS when they
      // change; the JS edits will be picked up by Webpack. The "add" event is fired when Chokidar
      // first discovers each file, which will cause JS to be generated as part of server
      // initialization.
      const convert = (path) => convertCsvFile(path, 'src/strings');
      chokidar.watch('src/strings/csv/*.csv').on('add', convert).on('change', convert);
      return middlewares;
    },
  },
  webpack: {
    snapshot: {
      ...whenDev(() => ({
        // Watch web-components, but not other modules, for changes.
        managedPaths: [/^(.+?[\\/]node_modules[\\/](?!(@terraware[\\/]web-components))(@.+?[\\/])?.+?)[\\/]/],
      })),
    },
  },
};
