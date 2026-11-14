import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';

import { buildOrganization, captureRequests, mockError, mockGet, renderWithProviders } from 'src/test-utils';

import AcceleratorReportTargetsTable from './AcceleratorReportTargetsTable';

const { featureEnabled } = rs.hoisted(() => ({ featureEnabled: rs.fn(() => true) }));
rs.mock('src/features', () => ({ useFeatureEnabled: featureEnabled }));
const projectPath = '/api/v1/accelerator/projects/1/reports';
const metadata = { category: 'Climate', level: 'Outcome', classId: 'Lifetime Cumulative', precision: 2 };

beforeEach(() => {
  featureEnabled.mockReturnValue(true);
  mockGet(`${projectPath}/years`, { years: { startYear: 2025, endYear: 2025 } });
  mockGet(`${projectPath}/indicators`, { indicators: [{ ...metadata, id: 1, name: 'Project indicator' }] });
  mockGet('/api/v1/accelerator/reports/commonIndicators', {
    indicators: [{ ...metadata, id: 2, name: 'Common indicator' }],
  });
  mockGet('/api/v1/accelerator/reports/autoCalculatedIndicators', {
    indicators: [{ ...metadata, indicator: 'Trees Planted', name: 'Auto indicator' }],
  });
  for (const type of ['project', 'common', 'autoCalculated']) {
    mockGet(`${projectPath}/${type}IndicatorTargets`, {
      targets: [
        {
          indicatorId: type === 'autoCalculated' ? 'Trees Planted' : type === 'project' ? 1 : 2,
          baseline: 1.25,
          endOfProjectTarget: 20,
          yearlyTargets: [{ year: 2025, target: 10.5 }],
        },
      ],
    });
  }
});

const renderTable = (editable = true) =>
  renderWithProviders(<AcceleratorReportTargetsTable />, {
    route: '/accelerator/projects/1/reports',
    path: '/accelerator/projects/:projectId/reports',
    organization: { selectedOrganization: buildOrganization({ role: editable ? 'Owner' : 'Contributor' }) },
  });

it.each([
  [
    true,
    'Project indicator',
    1,
    'projectIndicatorTarget/baseline',
    { indicatorId: 1, baseline: 7.5, endOfProjectTarget: 20 },
  ],
  [true, 'Common indicator', 2, 'commonIndicatorTarget', { indicatorId: 2, target: 7.5, year: 2025 }],
  [
    true,
    'Auto indicator',
    -1,
    'autoCalculatedIndicatorTarget/baseline',
    { indicator: 'Trees Planted', baseline: 1.25, endOfProjectTarget: 7.5 },
  ],
  [
    false,
    'Project indicator',
    1,
    'projectIndicatorTarget/baseline',
    { indicatorId: 1, baseline: 7.5, endOfProjectTarget: 20 },
  ],
] as const)(
  'saves the original row and numeric value with V2=%s for %s',
  async (flag, name, index, endpoint, payload) => {
    featureEnabled.mockReturnValue(flag);
    const requests = captureRequests('post', `${projectPath}/${endpoint}`);
    const { user } = renderTable();
    await screen.findByRole('row', { name: /Project indicator/ });
    await screen.findByRole('row', { name: /Common indicator/ });
    await screen.findByRole('row', { name: /Auto indicator/ });
    await waitFor(() => expect(screen.getByRole('columnheader', { name: /2025/ })).toBeVisible());
    const row = screen.getByRole('row', { name: new RegExp(name) });
    const cells = within(row).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent(name);
    await waitFor(() => expect(cells.at(-1)).toHaveTextContent('20'));
    await waitFor(() => expect(cells[1]).toHaveTextContent('1.25'));
    const cell = index === -1 ? cells.at(-1)! : cells[index];
    await user.dblClick(cell);
    const input = within(cell).getByRole('textbox');
    await user.clear(input);
    await user.type(input, '7.5{Enter}');
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual(payload);
  }
);

it('does not allow editing without target-update permission', async () => {
  const { user } = renderTable(false);
  const row = await screen.findByRole('row', { name: /Project indicator/ });
  await user.dblClick(within(row).getAllByRole('cell')[1]);
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

it('reports a failed V2 save without changing the displayed target', async () => {
  mockError('post', `${projectPath}/projectIndicatorTarget/baseline`);
  const { user, store } = renderTable();
  const row = await screen.findByRole('row', { name: /Project indicator/ });
  const cell = within(row).getAllByRole('cell')[1];
  await waitFor(() => expect(cell).toHaveTextContent('1.25'));
  await user.dblClick(cell);
  const input = within(cell).getByRole('textbox');
  await user.clear(input);
  await user.type(input, '7.5{Enter}');
  await waitFor(() => expect(store.getState().snackbar.snackbars.toast?.priority).toBe('critical'));
  expect(cell).toHaveTextContent('1.25');
});

it('renders an empty V2 table when there are no indicators', async () => {
  mockGet(`${projectPath}/indicators`, { indicators: [] });
  mockGet('/api/v1/accelerator/reports/commonIndicators', { indicators: [] });
  mockGet('/api/v1/accelerator/reports/autoCalculatedIndicators', { indicators: [] });
  renderTable();
  expect(await screen.findByRole('columnheader', { name: /2025/ })).toBeVisible();
  expect(screen.getByRole('cell')).toHaveAttribute('colspan', String(screen.getAllByRole('columnheader').length));
});
