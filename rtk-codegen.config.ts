import type { ConfigFile } from '@rtk-query/codegen-openapi';

require('dotenv').config();

const config: ConfigFile = {
  schemaFile: `${process.env.REACT_APP_TERRAWARE_API}/v3/api-docs`,
  apiFile: './src/queries/baseApi.ts',
  apiImport: 'baseApi',
  exportName: 'api',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  outputFiles: {
    './src/queries/generated/draftPlantingSites.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/draftSites'),
    },
    './src/queries/generated/events.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/events/'),
    },
    './src/queries/generated/fundingEntities.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/funder/entities'),
    },
    './src/queries/generated/modules.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/accelerator/modules'),
    },
    './src/queries/generated/notifications.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/notifications'),
    },
    './src/queries/generated/observations.ts': {
      filterEndpoints: (_, operation) =>
        operation.path.startsWith('/api/v1/tracking/observations') &&
        !operation.path.includes('{observationId}/splats'),
    },
    './src/queries/generated/observationSplats.ts': {
      filterEndpoints: (_, operation) =>
        operation.path.startsWith('/api/v1/tracking/observations/{observationId}/splats'),
    },
    './src/queries/generated/plantingSites.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/sites'),
    },
    './src/queries/generated/projects.ts': {
      filterEndpoints: (_, operation) =>
        operation.path.startsWith('/api/v1/projects') && !operation.path.includes('{id}/internalUsers'),
    },
    './src/queries/generated/projectInternalUsers.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/projects/{id}/internalUsers'),
    },
    './src/queries/generated/projectModules.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/accelerator/projects/{projectId}/modules'),
    },
    './src/queries/generated/publishedReports.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/funder/reports'),
    },
    './src/queries/generated/reports.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/accelerator/projects/{projectId}/reports'),
    },
    './src/queries/generated/reportMetrics.ts': {
      filterEndpoints: (_, operation) =>
        operation.path.startsWith('/api/v1/accelerator/reports/standardMetrics') ||
        operation.path.startsWith('/api/v1/accelerator/reports/systemMetrics'),
    },
    './src/queries/generated/t0.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/t0'),
    },
    // Disable regenerating Search API until OpenAPI annotation fix is completed.
    // './src/queries/generated/search.ts': {
    //   filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/search'),
    // },
  },
  prettierConfigFile: '.prettierrc',
  flattenArg: true,
};

export default config;
