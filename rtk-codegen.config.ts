import type { ConfigFile } from '@rtk-query/codegen-openapi';

require('dotenv').config();

const config: ConfigFile = {
  schemaFile: `${process.env.REACT_APP_TERRAWARE_API}/v3/api-docs`,
  apiFile: './src/queries/baseApi.ts',
  apiImport: 'baseApi',
  exportName: 'api',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  outputFiles: {
    './src/queries/generated/observations.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/observations'),
    },
  },
  prettierConfigFile: '.prettierrc',
  flattenArg: true,
};

export default config;
