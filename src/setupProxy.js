const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const serverPaths = ['/admin', '/api', '/sso', '/swagger-ui.html', '/swagger-ui', '/v3'];

  serverPaths.forEach((path) => {
    app.use(path, createProxyMiddleware({ target: process.env.REACT_APP_TERRAWARE_API, secure: false }));
  });
};
