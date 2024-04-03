const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const serverPaths = ['/admin', '/api', '/sso', '/swagger-ui.html', '/swagger-ui', '/v3'];
  const pddPaths = ['/api/v1/pdds', '/api/v1/methodologies', '/api/v1/variables'];

  pddPaths.forEach((path) => {
    app.use(path, createProxyMiddleware({ target: process.env.REACT_APP_PDD_API, secure: false }));
  });

  serverPaths.forEach((path) => {
    app.use(path, createProxyMiddleware({ target: process.env.REACT_APP_TERRAWARE_API, secure: false }));
  });
};
