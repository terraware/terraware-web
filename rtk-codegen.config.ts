import type { ConfigFile } from '@rtk-query/codegen-openapi';

require('dotenv').config();

const config: ConfigFile = {
  schemaFile: `${process.env.REACT_APP_TERRAWARE_API}/v3/api-docs`,
  apiFile: './src/queries/baseApi.ts',
  apiImport: 'baseApi',
  exportName: 'api',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  outputFiles: {
    './src/queries/generated/fundingEntities.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/funder/entities'),
    },
    './src/queries/generated/notifications.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/notifications'),
    },
    './src/queries/generated/observations.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/observations'),
    },
    // Disable regenerating Search API until OpenAPI annotation fix is completed.
    // './src/queries/generated/search.ts': {
    //   filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/search'),
    // },
    './src/queries/generated/events.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/events/'),
    },
  },
  prettierConfigFile: '.prettierrc',
  flattenArg: true,
};

export default config;
