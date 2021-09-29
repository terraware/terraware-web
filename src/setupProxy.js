const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const server_paths = [
    '/admin',
    '/api',
    '/sso',
    '/swagger-ui.html',
    '/swagger-ui',
    '/v3',
  ];

  server_paths.forEach((path) => {
    app.use(path, createProxyMiddleware({target: process.env.REACT_APP_TERRAWARE_API}));
  });
};
