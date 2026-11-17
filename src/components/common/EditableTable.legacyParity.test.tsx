import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { MRT_Localization_EN } from 'material-react-table/locales/en';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import ReportsSettings from 'src/scenes/AcceleratorRouter/AcceleratorProjects/Reports/ReportsSettings';
import MatrixView from 'src/scenes/AcceleratorRouter/MatrixView';
import strings from 'src/strings';
import { buildUser, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

rs.mock('src/features', () => ({ useFeatureEnabled: () => false }));

it.each(['targets', 'settings', 'matrix'] as const)(
  'preserves #7218 MRT presentation with the flag off: %s',
  async (scene) => {
    const path = '/api/v1/accelerator/projects/1/reports';
    mockGet(`${path}/years`, { years: { startYear: 2025, endYear: 2025 } });
    mockGet(`${path}/indicators`, { indicators: [] });
    mockGet(`${path}/configs`, { configs: [] });
    mockGet('/api/v1/accelerator/reports/commonIndicators', { indicators: [] });
    mockGet('/api/v1/accelerator/reports/autoCalculatedIndicators', { indicators: [] });
    for (const kind of ['project', 'common', 'autoCalculated']) {
      mockGet(`${path}/${kind}IndicatorTargets`, { targets: [] });
    }
    mockGet('/api/v1/users/me/savedTableViews', { views: [] });
    mockGet('/api/v1/document-producer/variables', { variables: [] });
    mockPost('/api/v1/search', { results: [] });
    const { user } = renderWithProviders(
      scene === 'matrix' ? (
        <MatrixView />
      ) : scene === 'targets' ? (
        <AcceleratorReportTargetsTable />
      ) : (
        <ReportsSettings />
      ),
      {
        route: '/accelerator/projects/1/reports',
        path: '/accelerator/projects/:projectId/reports',
        currentUser: { user: buildUser({ globalRoles: ['Super-Admin'] }) },
      }
    );
    const table = await screen.findByRole('table');
    const toolbar = within(table.closest('.MuiPaper-root')! as HTMLElement);
    const matrix = scene === 'matrix';
    expect(toolbar.queryAllByRole('textbox')).toHaveLength(matrix ? 1 : 0);
    if (!matrix) {
      expect(toolbar.queryByRole('button', { name: /filters|density|full screen/i })).not.toBeInTheDocument();
      expect(toolbar.queryByRole('button', { name: MRT_Localization_EN.columnActions! })).not.toBeInTheDocument();
      return;
    }
    expect(table).toHaveStyle({ tableLayout: 'fixed' });
    const buttons = [
      MRT_Localization_EN.showHideFilters!,
      strings.MANAGE_COLUMNS,
      MRT_Localization_EN.toggleDensity!,
      MRT_Localization_EN.toggleFullScreen!,
    ];
    expect(
      screen
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label'))
        .filter((label) => buttons.includes(label!))
    ).toEqual(buttons);
    const manage = document.getElementById('manageColumns')!;
    expect(manage.parentElement?.querySelectorAll('button')).toHaveLength(4);
    await user.click(screen.getAllByRole('button', { name: MRT_Localization_EN.columnActions! })[0]);
    await waitFor(() => expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0));
    expect(screen.queryByRole('menuitem', { name: MRT_Localization_EN.showAllColumns! })).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {
        name: MRT_Localization_EN.sortByColumnAsc!.replace('{column}', strings.DEAL_NAME),
      })
    ).toBeVisible();
  }
);
