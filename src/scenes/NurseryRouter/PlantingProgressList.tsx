import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, IconButton, Tooltip, useTheme } from '@mui/material';
import { BusySpinner, Button, EditableTable, EditableTableColumn } from '@terraware/web-components';
import { Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ColumnOrderState,
  MRT_DensityState,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { requestUpdatePlantingsCompleted } from 'src/redux/features/plantings/plantingsAsyncThunks';
import {
  PlantingProgress,
  selectStrataHaveStatistics,
  selectUpdatePlantingsCompleted,
} from 'src/redux/features/plantings/plantingsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import StatsWarningDialog from 'src/scenes/NurseryRouter/StatsWarningModal';
import { exportNurseryPlantingProgress } from 'src/scenes/NurseryRouter/exportNurseryData';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export type PlantingProgressListProps = {
  rows: Partial<PlantingProgress>[] | undefined;
  reloadTracking: () => void;
};

export default function PlantingProgressList({ rows, reloadTracking }: PlantingProgressListProps): JSX.Element {
  const theme = useTheme();
  const [hasStrata, setHasStrata] = useState<boolean | undefined>();
  const [rowSelection, setRowSelection] = useState({});
  const dispatch = useAppDispatch();
  const defaultTimeZone = useDefaultTimeZone();
  const { selectedOrganization } = useOrganization();
  const [requestId, setRequestId] = useState<string>('');
  const [selectedStratumIdsBySiteId, setSelectedStratumIdsBySiteId] = useState<Record<number, Set<number>>>();
  const updatePlantingResult = useAppSelector((state) => selectUpdatePlantingsCompleted(state, requestId));
  const substrataStatisticsResult = useAppSelector((state) =>
    selectStrataHaveStatistics(
      state,
      selectedOrganization?.id || -1,
      selectedStratumIdsBySiteId,
      defaultTimeZone.get().id
    )
  );
  const snackbar = useSnackbar();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [markingAsComplete, setMarkingAsComplete] = useState(false);
  const [showColumnFilters, setShowColumnFilters] = useState(() => {
    try {
      for (const key of [
        'plantings-progress-table-with-strata_columnFilters',
        'plantings-progress-table-without-strata_columnFilters',
      ]) {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return true;
          }
        }
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [density, setDensity] = useState<MRT_DensityState>(() => {
    try {
      return (localStorage.getItem('plantings-progress-table-density') as MRT_DensityState) || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const [columnOrderWithStrata, setColumnOrderWithStrata] = useState<MRT_ColumnOrderState>(() => {
    try {
      const saved = localStorage.getItem('plantings-progress-table-with-strata-columnOrder');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [columnOrderWithoutStrata, setColumnOrderWithoutStrata] = useState<MRT_ColumnOrderState>(() => {
    try {
      const saved = localStorage.getItem('plantings-progress-table-without-strata-columnOrder');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('plantings-progress-table-with-strata-columnOrder', JSON.stringify(columnOrderWithStrata));
    } catch {
      // ignore
    }
  }, [columnOrderWithStrata]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'plantings-progress-table-without-strata-columnOrder',
        JSON.stringify(columnOrderWithoutStrata)
      );
    } catch {
      // ignore
    }
  }, [columnOrderWithoutStrata]);

  const selectedRows = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => (rows || [])[Number(index)])
        .filter(Boolean),
    [rowSelection, rows]
  );

  useEffect(() => {
    if (rows && hasStrata === undefined) {
      setHasStrata(rows.some((d) => d.substratumName));
    }
  }, [rows, hasStrata]);

  useEffect(() => {
    if (selectedRows.length > 0) {
      const stratumIds = selectedRows.reduce((selectedStratumIdsBySiteIdObj: Record<number, Set<number>>, row: any) => {
        const siteId = row.siteId;
        if (selectedStratumIdsBySiteIdObj[siteId]) {
          selectedStratumIdsBySiteIdObj[siteId].add(row.stratumId);
        } else {
          selectedStratumIdsBySiteIdObj[siteId] = new Set([row.stratumId]);
        }
        return selectedStratumIdsBySiteIdObj;
      }, {});
      setSelectedStratumIdsBySiteId(stratumIds);
    }
  }, [selectedRows]);

  useEffect(() => {
    reloadTracking();
  }, [reloadTracking]);

  useEffect(() => {
    if (updatePlantingResult?.status === 'success') {
      reloadTracking();
      setRequestId('');
      if (markingAsComplete) {
        snackbar.toastSuccess(strings.SUBSTRATUM_PLANTING_COMPLETED_SUCCESS, strings.SAVED);
      } else {
        snackbar.toastSuccess(strings.SUBSTRATUM_PLANTING_UNCOMPLETED_SUCCESS, strings.SAVED);
      }
    } else if (updatePlantingResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      setRequestId('');
    }
  }, [updatePlantingResult, reloadTracking, snackbar, markingAsComplete]);

  const setPlantingCompleted = useCallback(
    (complete: boolean) => {
      const substratumIds = selectedRows
        .map((row: any) => row.substratumId)
        .filter((id): id is number => id !== undefined);
      const request = dispatch(
        requestUpdatePlantingsCompleted({ substratumIds, planting: { plantingCompleted: complete } })
      );
      setMarkingAsComplete(complete);
      setRequestId(request.requestId);
    },
    [dispatch, selectedRows]
  );

  const onModalSubmit = useCallback(() => {
    setShowWarningModal(false);
    setPlantingCompleted(false);
  }, [setPlantingCompleted]);

  const onCloseStatsWarningModal = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  // Cell renderer components
  const TargetPlantingDensityCell = useCallback(({ cell }: { cell: MRT_Cell<Partial<PlantingProgress>> }) => {
    const value = cell.row.original.targetPlantingDensity;
    return value ? <FormattedNumber value={value} /> : null;
  }, []);

  const TotalSeedlingsSentCell = useCallback(({ cell }: { cell: MRT_Cell<Partial<PlantingProgress>> }) => {
    const row = cell.row.original;
    const filterParam = row.substratumName
      ? `substratumName=${encodeURIComponent(row.stratumName || '')}-${encodeURIComponent(row.substratumName)}&siteName=${encodeURIComponent(row.siteName || '')}`
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

  const columnsWithoutStrata = useMemo<EditableTableColumn<Partial<PlantingProgress>>[]>(
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

  const columnsWithStrata = useMemo<EditableTableColumn<Partial<PlantingProgress>>[]>(
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

  const validateUndoPlantingComplete = useCallback(() => {
    if (substrataStatisticsResult) {
      setShowWarningModal(true);
      return;
    }
    setPlantingCompleted(false);
  }, [substrataStatisticsResult, setPlantingCompleted]);

  const areAllIncompleted = useMemo(
    () => selectedRows.every((row: any) => row.plantingCompleted === false),
    [selectedRows]
  );

  const areAllCompleted = useMemo(
    () => selectedRows.every((row: any) => row.plantingCompleted === true),
    [selectedRows]
  );

  if (!rows || hasStrata === undefined) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return (
    <Box>
      {showWarningModal && (
        <StatsWarningDialog open={showWarningModal} onClose={onCloseStatsWarningModal} onSubmit={onModalSubmit} />
      )}
      <Box>{updatePlantingResult?.status === 'pending' && <BusySpinner withSkrim={true} />}</Box>
      <EditableTable
        key={hasStrata ? 'plantings-progress-table-with-strata' : 'plantings-progress-table-without-strata'}
        columns={hasStrata ? columnsWithStrata : columnsWithoutStrata}
        data={rows}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={true}
        stickyFilters={true}
        storageKey={hasStrata ? 'plantings-progress-table-with-strata' : 'plantings-progress-table-without-strata'}
        enablePagination={false}
        enableTopToolbar={true}
        enableBottomToolbar={false}
        initialSorting={[{ id: hasStrata ? 'substratumName' : 'siteName', desc: false }]}
        tableOptions={{
          state: {
            rowSelection,
            showColumnFilters,
            showGlobalFilter,
            density,
            columnOrder: hasStrata ? columnOrderWithStrata : columnOrderWithoutStrata,
          },
          onRowSelectionChange: setRowSelection,
          onShowColumnFiltersChange: setShowColumnFilters,
          onShowGlobalFilterChange: setShowGlobalFilter,
          onColumnOrderChange: (updater) => {
            const setter = hasStrata ? setColumnOrderWithStrata : setColumnOrderWithoutStrata;
            setter((prev) => (typeof updater === 'function' ? updater(prev) : updater));
          },
          onDensityChange: (updater) => {
            setDensity((prev) => {
              const next = typeof updater === 'function' ? updater(prev) : updater;
              try {
                localStorage.setItem('plantings-progress-table-density', next);
              } catch {
                // ignore
              }
              return next;
            });
          },
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
                  onClick={validateUndoPlantingComplete}
                  disabled={!areAllCompleted}
                  label={strings.UNDO_PLANTING_COMPLETE}
                  priority='secondary'
                />
                <Button
                  type='passive'
                  onClick={() => setPlantingCompleted(true)}
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
                    const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original);
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
