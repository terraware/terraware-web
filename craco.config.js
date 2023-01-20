const { whenDev } = require('@craco/craco');

module.exports = {
  webpack: {
    snapshot: {
      ...whenDev(() => ({
        // Watch web-components, but not other modules, for changes.
        managedPaths: [/^(.+?[\\/]node_modules[\\/](?!(@terraware[\\/]web-components))(@.+?[\\/])?.+?)[\\/]/],
      })),
    },
  },
};
