const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Configures the dev environment to forward API requests to seedbank-server.
 *
 * This is only used in development mode (yarn start); in production, Nginx
 * takes care of request forwarding.
 */
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_SEED_BANK_API,
      changeOrigin: true,
    })
  );
};

