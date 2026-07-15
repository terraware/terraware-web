import type { ConfigFile } from '@rtk-query/codegen-openapi';

require('dotenv').config();

const config: ConfigFile = {
  schemaFile: `${process.env.PUBLIC_TERRAWARE_API}/v3/api-docs`,
  apiFile: './src/queries/baseApi.ts',
  apiImport: 'baseApi',
  exportName: 'api',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  outputFiles: {
    './src/queries/generated/acceleratorProjects.ts': {
      filterEndpoints: (_, operation) =>
        operation.path === '/api/v1/accelerator/projects' ||
        operation.path === '/api/v1/accelerator/projects/{projectId}',
    },
    './src/queries/generated/deliveries.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/deliveries'),
    },
    './src/queries/generated/disclaimer.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/disclaimer'),
    },
    './src/queries/generated/users.ts': {
      filterEndpoints: (_, operation) =>
        operation.path === '/api/v1/users' ||
        operation.path === '/api/v1/users/me' ||
        operation.path === '/api/v1/users/{userId}',
    },
    './src/queries/generated/draftPlantingSites.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/draftSites'),
    },
    './src/queries/generated/events.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/events/'),
    },
    './src/queries/generated/activities.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/accelerator/activities'),
    },
    './src/queries/generated/funderActivities.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/funder/activities'),
    },
    './src/queries/generated/fundingEntities.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/funder/entities'),
    },
    './src/queries/generated/globalRoles.ts': {
      filterEndpoints: (_, operation) =>
        operation.path === '/api/v1/globalRoles/users' || operation.path === '/api/v1/users/{userId}/globalRoles',
    },
    './src/queries/generated/mapbox.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/mapbox'),
    },
    './src/queries/generated/modules.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/accelerator/modules'),
    },
    './src/queries/generated/notifications.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/notifications'),
    },
    './src/queries/generated/nurseryWithdrawals.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/nursery/withdrawals'),
    },
    './src/queries/generated/observations.ts': {
      filterEndpoints: (_, operation) =>
        operation.path.startsWith('/api/v1/tracking/observations') &&
        !operation.path.includes('{observationId}/splats'),
    },
    './src/queries/generated/organizationFeatures.ts': {
      filterEndpoints: (_, operation) => operation.path === '/api/v1/organizations/{organizationId}/features',
    },
    './src/queries/generated/organizationMedia.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/organizations/{organizationId}/media'),
    },
    './src/queries/generated/organizationSplats.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/organizations/{organizationId}/splats'),
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
    './src/queries/generated/substrata.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/substrata'),
    },
    './src/queries/generated/accessionsV1.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/seedbank/accessions'),
    },
    './src/queries/generated/accessionsV2.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v2/seedbank/accessions'),
    },
    './src/queries/generated/userInternalInterests.ts': {
      filterEndpoints: (_, operation) => operation.path === '/api/v1/users/{userId}/internalInterests',
    },
    './src/queries/generated/indicators.ts': {
      filterEndpoints: (_, operation) =>
        operation.path.startsWith('/api/v1/accelerator/projects/{projectId}/reports/indicators') ||
        operation.path.startsWith('/api/v1/accelerator/reports/autoCalculatedIndicators') ||
        operation.path.startsWith('/api/v1/accelerator/reports/commonIndicators'),
    },
    './src/queries/generated/t0.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/t0'),
    },
    './src/queries/generated/plantingSeasons.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/planting-seasons'),
    },
    './src/queries/generated/stats.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/tracking/stats'),
    },
    './src/queries/generated/support.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/support'),
    },
    './src/queries/generated/publicStatistics.ts': {
      filterEndpoints: (_, operation) => operation.path.startsWith('/api/v1/public/statistics'),
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
