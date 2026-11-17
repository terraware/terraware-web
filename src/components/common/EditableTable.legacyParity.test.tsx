import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { useMaterialReactTable } from 'material-react-table';
import * as actualMrt from 'material-react-table' with { rstest: 'importActual' };
import { MRT_Localization_EN } from 'material-react-table/locales/en';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import { mobileTopToolbarSx } from 'src/components/common/table/mobileTopToolbarSx';
import ReportsSettings from 'src/scenes/AcceleratorRouter/AcceleratorProjects/Reports/ReportsSettings';
import MatrixView from 'src/scenes/AcceleratorRouter/MatrixView';
import strings from 'src/strings';
import { buildUser, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

rs.mock('src/features', () => ({ useFeatureEnabled: () => false }));
rs.mock('material-react-table', () => ({
  ...actualMrt,
  useMaterialReactTable: rs.fn(actualMrt.useMaterialReactTable),
}));

it.each(['targets', 'settings', 'matrix'] as const)(
  'preserves #7218 MRT presentation with the flag off: %s',
  async (scene) => {
    const path = '/api/v1/accelerator/projects/1/reports';
    mockGet(`${path}/years`, { years: { startYear: 2025, endYear: 2025 } });
    mockGet(`${path}/indicators`, { indicators: [] });
    mockGet(`${path}/configs`, { configs: [] });
    mockGet('/api/v1/accelerator/reports/commonIndicators', { indicators: [] });
    mockGet('/api/v1/accelerator/reports/autoCalculatedIndicators', { indicators: [] });
    for (const kind of ['project', 'common', 'autoCalculated'])
      mockGet(`${path}/${kind}IndicatorTargets`, { targets: [] });
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
    await screen.findByRole('table');
    const options = rs.mocked(useMaterialReactTable).mock.calls.at(-1)![0];
    const matrix = scene === 'matrix';
    expect({
      topToolbar: options.enableTopToolbar,
      ordering: options.enableColumnOrdering,
      globalFilter: options.enableGlobalFilter,
      ranked: options.enableGlobalFilterRankedResults,
      globalVisible: options.state?.showGlobalFilter,
      initialFiltersVisible: options.initialState?.showColumnFilters,
      mobileToolbar: options.muiTopToolbarProps,
      columnActions: options.enableColumnActions,
      hiding: options.enableHiding,
    }).toEqual({
      topToolbar: matrix,
      ordering: matrix,
      globalFilter: true,
      ranked: matrix ? false : undefined,
      globalVisible: matrix ? true : undefined,
      initialFiltersVisible: matrix ? false : undefined,
      mobileToolbar: matrix ? { sx: mobileTopToolbarSx } : undefined,
      columnActions: matrix ? undefined : false,
      hiding: matrix ? undefined : false,
    });
    if (!matrix) {
      expect(options.renderColumnActionsMenuItems).toBeUndefined();
      expect(screen.queryByRole('button', { name: /filters|density|full screen/i })).not.toBeInTheDocument();
      return;
    }
    expect(options.muiTableProps).toEqual({ sx: { tableLayout: 'fixed' } });
    expect(options.muiTableBodyRowProps).toEqual({ sx: { '& td': { borderBottom: 'none' } } });
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
