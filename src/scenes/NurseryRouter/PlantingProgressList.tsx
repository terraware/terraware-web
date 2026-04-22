import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, IconButton, Tooltip, useTheme } from '@mui/material';
import { BusySpinner, Button, EditableTable, EditableTableColumn } from '@terraware/web-components';
import { Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useTableState from 'src/hooks/useTableState';
import { useOrganization } from 'src/providers';
import { useLazyListPlantingSiteReportedPlantsQuery } from 'src/queries/generated/plantingSites';
import { useUpdateSubstrataMutation } from 'src/queries/generated/substrata';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import { exportNurseryPlantingProgress } from 'src/scenes/NurseryRouter/exportNurseryData';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

// selector to search plantings

type PlantingProgressType = {
  plantingCompleted: boolean;
  projectName: string;
  siteId: number;
  siteName: string;
  stratumId: number;
  stratumName: string;
  substratumId: number;
  substratumName: string;
  targetPlantingDensity: number;
  totalPlants: number;
  totalSeedlingsSent: number;
};

export default function PlantingProgressList(): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [rowSelection, setRowSelection] = useState({});
  const { selectedOrganization } = useOrganization();

  const projects = useAppSelector(selectProjects);
  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const [listReportedPlants, listReportedPlantsResponse] = useLazyListPlantingSiteReportedPlantsQuery();
  const [updateSubstratum, { isLoading }] = useUpdateSubstrataMutation();

  useEffect(() => {
    if (selectedOrganization) {
      void listReportedPlants({ organizationId: selectedOrganization.id }, true);
    }
  }, [listReportedPlants, selectedOrganization]);

  const rows = useMemo((): Partial<PlantingProgressType>[] => {
    if (listReportedPlantsResponse.currentData) {
      return listReportedPlantsResponse.currentData.sites
        .filter((siteReportedPlants) => siteReportedPlants.totalPlants > 0)
        .flatMap((siteReportedPlants) => {
          if (siteReportedPlants.strata.length) {
            return siteReportedPlants.strata
              .filter((stratumReportedPlants) => stratumReportedPlants.totalPlants > 0)
              .flatMap((stratumReportedPlants) =>
                stratumReportedPlants.substrata
                  .filter((substratumReportedPlants) => substratumReportedPlants.totalPlants > 0)
                  .map((substratumReportedPlants) => {
                    const site = plantingSites.find((thisSite) => thisSite.id === siteReportedPlants.id);
                    const stratum = site?.strata?.find((thisStratum) => thisStratum.id === stratumReportedPlants.id);
                    const substratum = stratum?.substrata.find(
                      (thisSubstratum) => thisSubstratum.id === substratumReportedPlants.id
                    );
                    return {
                      plantingCompleted: substratum?.plantingCompleted,
                      projectName: site?.projectId
                        ? projects?.find((project) => project.id === site.projectId)?.name ?? ''
                        : '',
                      siteId: site?.id,
                      siteName: site?.name,
                      stratumId: stratum?.id,
                      stratumName: stratum?.name,
                      substratumId: substratum?.id,
                      substratumName: substratum?.name,
                      targetPlantingDensity: stratum?.targetPlantingDensity,
                      totalPlants: substratumReportedPlants.totalPlants,
                      totalSeedlingsSent: substratumReportedPlants.totalPlants,
                    };
                  })
              );
          } else {
            const site = plantingSites.find((thisSite) => thisSite.id === siteReportedPlants.id);
            return [
              {
                projectName: site?.projectId
                  ? projects?.find((project) => project.id === site.projectId)?.name ?? ''
                  : '',
                siteId: site?.id,
                siteName: site?.name,
                totalPlants: siteReportedPlants.totalPlants,
                totalSeedlingsSent: siteReportedPlants.totalPlants,
              },
            ];
          }
        });
    } else {
      return [];
    }
  }, [plantingSites, listReportedPlantsResponse.currentData, projects]);

  const selectedRows = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => (rows || [])[Number(index)])
        .filter(Boolean),
    [rowSelection, rows]
  );

  const hasStrata = useMemo(() => {
    if (!rows) {
      return undefined;
    }

    return rows.some((d) => d.substratumName);
  }, [rows]);

  const withStrataState = useTableState('plantings-progress-table-with-strata');
  const withoutStrataState = useTableState('plantings-progress-table-without-strata');
  const activeState = hasStrata !== false ? withStrataState : withoutStrataState;
  const {
    density,
    onDensityChange,
    onPaginationChange,
    pagination,
    showColumnFilters,
    setShowColumnFilters,
    showGlobalFilter,
    setShowGlobalFilter,
  } = activeState;

  const tableStateStorageKey = hasStrata
    ? 'plantings-progress-table-with-strata'
    : 'plantings-progress-table-without-strata';

  const setPlantingCompleted = useCallback(
    async (complete: boolean) => {
      const substratumIds = selectedRows
        .map((row: any) => row.substratumId)
        .filter((id): id is number => id !== undefined);

      const promises = substratumIds.map((substratumId) =>
        updateSubstratum({ id: substratumId, updateSubstratumRequestPayload: { plantingCompleted: complete } })
      );

      try {
        await Promise.allSettled(promises);
        if (complete) {
          snackbar.toastSuccess(strings.SUBSTRATUM_PLANTING_COMPLETED_SUCCESS, strings.SAVED);
        } else {
          snackbar.toastSuccess(strings.SUBSTRATUM_PLANTING_UNCOMPLETED_SUCCESS, strings.SAVED);
        }
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    },
    [selectedRows, snackbar, updateSubstratum]
  );

  // Cell renderer components
  const TargetPlantingDensityCell = useCallback(({ cell }: { cell: MRT_Cell<Partial<PlantingProgressType>> }) => {
    const value = cell.row.original.targetPlantingDensity;
    return value ? <FormattedNumber value={value} /> : null;
  }, []);

  const TotalSeedlingsSentCell = useCallback(({ cell }: { cell: MRT_Cell<Partial<PlantingProgressType>> }) => {
    const row = cell.row.original;
    const filterParam = row.substratumName
      ? `substratumName=${encodeURIComponent(row.substratumName)}&siteName=${encodeURIComponent(row.siteName || '')}`
      : `siteName=${encodeURIComponent(row.siteName || '')}`;
    const url = `${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawal_history&${filterParam}`;
    return (
      <Link fontSize='16px' to={url}>
        <FormattedNumber value={row.totalSeedlingsSent || 0} />
      </Link>
    );
  }, []);

  const uniqueSiteNames = useMemo(() => {
    if (!rows) {
      return [];
    }
    return Array.from(new Set(rows.map((row) => row.siteName).filter((name): name is string => !!name))).sort();
  }, [rows]);

  const uniqueProjectNames = useMemo(() => {
    if (!rows) {
      return [];
    }
    const projectNames = rows
      .map((row) => row.projectName)
      .filter((name): name is string => name !== undefined && name !== null && name !== '');
    return Array.from(new Set(projectNames)).sort();
  }, [rows]);

  const columnsWithoutStrata = useMemo<EditableTableColumn<Partial<PlantingProgressType>>[]>(
    () => [
      {
        id: 'siteName',
        header: strings.PLANTING_SITE,
        accessorKey: 'siteName',
        filterVariant: 'select',
        filterSelectOptions: uniqueSiteNames,
        sortUndefined: 'last',
      },
      {
        id: 'projectName',
        header: strings.PROJECT,
        accessorKey: 'projectName',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
        sortUndefined: 'last',
      },
      {
        id: 'totalSeedlingsSent',
        header: strings.TOTAL_SEEDLINGS_SENT,
        accessorKey: 'totalSeedlingsSent',
        filterVariant: 'range',
        sortUndefined: 'last',
        Cell: TotalSeedlingsSentCell,
      },
    ],
    [TotalSeedlingsSentCell, uniqueSiteNames, uniqueProjectNames]
  );

  const PlantingCompleteHeader = useCallback(
    ({ column }: { column: any }) => (
      <Tooltip title={strings.PLANTING_COMPLETE_TOOLTIP}>
        <span>{column.columnDef.header as string}</span>
      </Tooltip>
    ),
    []
  );

  const TargetPlantingDensityHeader = useCallback(
    ({ column }: { column: any }) => (
      <Tooltip title={strings.TARGET_PLANTING_DENSITY_TOOLTIP}>
        <span>{column.columnDef.header as string}</span>
      </Tooltip>
    ),
    []
  );

  const columnsWithStrata = useMemo<EditableTableColumn<Partial<PlantingProgressType>>[]>(
    () => [
      {
        id: 'siteName',
        header: strings.PLANTING_SITE,
        accessorKey: 'siteName',
        filterVariant: 'select',
        filterSelectOptions: uniqueSiteNames,
        sortUndefined: 'last',
      },
      {
        id: 'stratumName',
        header: strings.STRATUM,
        accessorKey: 'stratumName',
        filterVariant: 'text',
        sortUndefined: 'last',
      },
      {
        id: 'substratumName',
        header: strings.SUBSTRATUM,
        accessorKey: 'substratumName',
        filterVariant: 'text',
        sortUndefined: 'last',
      },
      {
        id: 'plantingCompleted',
        header: strings.PLANTING_COMPLETE,
        accessorFn: (row) => {
          if (row.plantingCompleted === true) {
            return strings.YES;
          }
          if (row.plantingCompleted === false) {
            return strings.NO;
          }
          return '';
        },
        filterVariant: 'select',
        filterSelectOptions: [strings.YES, strings.NO],
        sortUndefined: 'last',
        Header: PlantingCompleteHeader,
      },
      {
        id: 'projectName',
        header: strings.PROJECT,
        accessorKey: 'projectName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
        sortUndefined: 'last',
      },
      {
        id: 'targetPlantingDensity',
        header: strings.TARGET_PLANTING_DENSITY,
        accessorKey: 'targetPlantingDensity',
        enableEditing: false,
        filterVariant: 'range',
        sortUndefined: 'last',
        Cell: TargetPlantingDensityCell,
        Header: TargetPlantingDensityHeader,
      },
      {
        id: 'totalSeedlingsSent',
        header: strings.TOTAL_SEEDLINGS_SENT,
        accessorKey: 'totalSeedlingsSent',
        enableEditing: false,
        filterVariant: 'range',
        sortUndefined: 'last',
        Cell: TotalSeedlingsSentCell,
      },
    ],
    [
      TargetPlantingDensityCell,
      TotalSeedlingsSentCell,
      PlantingCompleteHeader,
      TargetPlantingDensityHeader,
      uniqueSiteNames,
      uniqueProjectNames,
    ]
  );

  const areAllIncompleted = useMemo(
    () => selectedRows.every((row: any) => row.plantingCompleted === false),
    [selectedRows]
  );

  const areAllCompleted = useMemo(
    () => selectedRows.every((row: any) => row.plantingCompleted === true),
    [selectedRows]
  );

  if (!rows) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return (
    <Box>
      <Box>{isLoading && <BusySpinner withSkrim={true} />}</Box>
      <EditableTable
        key={hasStrata ? 'plantings-progress-table-with-strata' : 'plantings-progress-table-without-strata'}
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={hasStrata ? columnsWithStrata : columnsWithoutStrata}
        data={rows}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={true}
        stickyFilters={true}
        storageKey={tableStateStorageKey}
        enablePagination={true}
        enableTopToolbar={true}
        enableBottomToolbar={true}
        initialSorting={[{ id: hasStrata ? 'substratumName' : 'siteName', desc: false }]}
        tableOptions={{
          state: {
            rowSelection,
            columnVisibility: activeState.columnVisibility,
            density,
            pagination,
            showColumnFilters,
            showGlobalFilter,
            columnOrder: activeState.columnOrder,
          },
          onRowSelectionChange: setRowSelection,
          onPaginationChange,
          onColumnVisibilityChange: activeState.setColumnVisibility,
          onShowColumnFiltersChange: setShowColumnFilters,
          onShowGlobalFilterChange: setShowGlobalFilter,
          onColumnOrderChange: activeState.setColumnOrder,
          onDensityChange,
          enableRowSelection: true,
          enableColumnPinning: true,
          enableColumnActions: true,
          enableHiding: true,
          enableGrouping: false,
          enableColumnDragging: true,
          positionGlobalFilter: 'right',
          getRowId: (row, index) => String(index),
          renderToolbarAlertBannerContent: ({ selectedAlert }) => (
            <Box display='flex' gap={1} alignItems='center' justifyContent='space-between' width='100%'>
              {selectedAlert}
              <Box display='flex' gap={1} alignItems='center'>
                <Button
                  type='passive'
                  onClick={() => void setPlantingCompleted(false)}
                  disabled={!areAllCompleted}
                  label={strings.UNDO_PLANTING_COMPLETE}
                  priority='secondary'
                />
                <Button
                  type='passive'
                  onClick={() => void setPlantingCompleted(true)}
                  disabled={!areAllIncompleted}
                  label={strings.SET_PLANTING_COMPLETE}
                  priority='secondary'
                />
              </Box>
            </Box>
          ),
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
              <Tooltip title={strings.EXPORT}>
                <IconButton
                  onClick={() => {
                    const filteredRows = table.getSortedRowModel().rows.map((row) => row.original);
                    void exportNurseryPlantingProgress({ plantingProgress: filteredRows });
                  }}
                >
                  <Icon name='iconExport' size='medium' />
                </IconButton>
              </Tooltip>
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ToggleFiltersButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />
              <MRT_ToggleDensePaddingButton table={table} />
              <MRT_ToggleFullScreenButton table={table} />
            </Box>
          ),
          muiTableBodyProps: {
            sx: {
              '& tr:nth-of-type(odd) > td': {
                backgroundColor: theme.palette.TwClrBaseGray025,
              },
            },
          },
          muiTablePaperProps: {
            elevation: 0,
            sx: { padding: 0 },
          },
          muiTopToolbarProps: {
            sx: {
              position: 'relative',
              '& > .MuiBox-root': {
                position: 'relative',
              },
              '& .Mui-ToolbarDropZone': {
                display: 'none',
              },
            },
          },
          muiToolbarAlertBannerProps: {
            sx: {
              backgroundColor: theme.palette.TwClrBaseGray050,
              '.MuiAlert-message': {
                padding: theme.spacing(1, 3),
              },
            },
          },
          muiTableBodyRowProps: {
            sx: {
              '& td': {
                borderBottom: 'none',
              },
            },
          },
        }}
        sx={{ padding: 0 }}
      />
    </Box>
  );
}
