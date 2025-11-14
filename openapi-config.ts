import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'http://localhost:8080/v3/api-docs',
  apiFile: './src/queries/emptyApi.ts',
  apiImport: 'emptyApi',
  exportName: 'api',
  hooks: true,
  outputFiles: {
    './src/queries/generated/fundingEntityApi.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/funder'),
    },
    './src/queries/generated/searchApi.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/search'),
    },
  },
};

export default config;
