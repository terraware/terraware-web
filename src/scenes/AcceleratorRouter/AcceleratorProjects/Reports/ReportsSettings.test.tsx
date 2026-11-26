import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { api as reportsApi } from 'src/queries/generated/acceleratorReports';
import { captureRequests, mockGet, mockPut, renderWithProviders } from 'src/test-utils';

import ReportsSettings from './ReportsSettings';

const PROJECT_ID = 7;
const indicatorsPath = `/api/v1/indicators/projects/${PROJECT_ID}`;
const configsPath = `/api/v1/accelerator/projects/${PROJECT_ID}/reports/configs`;
const metadata = { category: 'Climate', level: 'Outcome', classId: 'Lifetime Cumulative', precision: 2 };

it('shows the common indicators seeded by the first reporting configuration', async () => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/users/me');
  mockGet('/api/v1/users/me/preferences');
  mockGet(configsPath, { configs: [] });
  mockGet(`${indicatorsPath}/project`, { indicators: [] });
  mockGet('/api/v1/accelerator/reports/autoCalculatedIndicators', { indicators: [] });
  // An unconfigured project has no settings rows yet, so this list starts empty.
  const commonRequests = captureRequests('get', `${indicatorsPath}/common`, { indicators: [] });
  mockPut(configsPath, {});

  const { store } = renderWithProviders(<ReportsSettings />, {
    route: `/accelerator/projects/${PROJECT_ID}/reports`,
    path: '/accelerator/projects/:projectId/*',
  });

  await waitFor(() => expect(commonRequests).toHaveLength(1));
  expect(screen.queryByText('Seeds Collected')).toBeNull();

  // Saving the first configuration is what creates the project's settings rows.
  mockGet(`${indicatorsPath}/common`, {
    indicators: [{ ...metadata, id: 1, name: 'Seeds Collected', active: true, isPublishable: false }],
  });
  await store.dispatch(
    reportsApi.endpoints.createAcceleratorReportConfig.initiate({
      projectId: PROJECT_ID,
      createAcceleratorReportConfigRequestPayload: {
        config: { reportingStartDate: '2026-01-01', reportingEndDate: '2026-12-31' },
      },
    })
  );

  expect(await screen.findByText('Seeds Collected')).toBeVisible();
});
