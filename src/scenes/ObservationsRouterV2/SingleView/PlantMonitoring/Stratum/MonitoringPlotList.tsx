import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import {
  MRT_Cell,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { APP_PATHS } from 'src/constants';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useReassignPlotModal } from 'src/scenes/ObservationsRouterV2/Reassign';
import { ObservationState, getPlotStatus } from 'src/types/Observations';
import { isManagerOrHigher } from 'src/utils/organization';
import { makeDateRangeFilterFn } from 'src/utils/tableFilters';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const STORAGE_KEY = 'observation-stratum-monitoring-plot-table';

type MonitoringPlotRow = {
  observationId: number;
  observationState: ObservationState;
  monitoringPlotId: number;
  monitoringPlotNumber: number;
  stratumName: string;
  substratumName: string;
  completedDate?: string;
  status: string;
  isPermanent?: boolean;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
};

const MonitoringPlotActionsMenuContent = ({ row }: { row: MonitoringPlotRow }): JSX.Element => {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { openReassignPlotModal } = useReassignPlotModal();
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);

  return (
    <TableRowPopupMenu
      menuItems={[
        {
          disabled: !replaceObservationPlotEnabled || !!row.completedDate || row.observationState === 'Abandoned',
          label: strings.REQUEST_REASSIGNMENT,
          onClick: () => {
            openReassignPlotModal(row.observationId, row.monitoringPlotId);
          },
        },
      ]}
    />
  );
};

export default function MonitoringPlotList(): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone().get().id;
  const params = useParams<{ observationId: string; stratumName: string }>();
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);

  const {
    columnFilters,
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    setColumnFilters,
    setColumnOrder,
    setColumnVisibility,
    setShowColumnFilters,
    setShowGlobalFilter,
    showColumnFilters,
    showGlobalFilter,
  } = useTableState(STORAGE_KEY, { persistFilters: true });

  const { data: observationResultsResponse, isLoading } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();

  const observationResult = useMemo(
    () => observationResultsResponse?.observation,
    [observationResultsResponse?.observation]
  );

  const stratumResult = useMemo(
    () => observationResult?.strata.find((stratum) => stratum.name === stratumName),
    [observationResult, stratumName]
  );

  useEffect(() => {
    if (observationResult) {
      void getPlantingSite(observationResult.plantingSiteId, true);
    }
  }, [getPlantingSite, observationResult]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);
  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone, [defaultTimeZone, plantingSite?.timeZone]);

  const rows = useMemo((): MonitoringPlotRow[] => {
    if (observationResult && stratumResult) {
      return stratumResult.substrata.flatMap((substratum) =>
        substratum.monitoringPlots.map((plot): MonitoringPlotRow => {
          const totalLive = plot.species.reduce((total, plotSpecies) => total + plotSpecies.totalLive, 0);
          return {
            observationId,
            observationState: observationResult.state,
            monitoringPlotId: plot.monitoringPlotId,
            monitoringPlotNumber: plot.monitoringPlotNumber,
            stratumName: stratumResult.name,
            substratumName: substratum.name,
            completedDate: plot.completedTime,
            status: getPlotStatus(plot.status),
            isPermanent: plot.isPermanent,
            totalLive,
            totalPlants: plot.totalPlants,
            totalSpecies: plot.totalSpecies,
            plantingDensity: plot.plantingDensity,
            survivalRate: plot.survivalRate,
          };
        })
      );
    } else {
      return [];
    }
  }, [observationId, observationResult, stratumResult]);

  const PlotNumberCell = useCallback(({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => {
    const row = cell.row.original;
    const url = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS_V2.replace(':observationId', row.observationId.toString())
      .replace(':stratumName', row.stratumName)
      .replace(':monitoringPlotId', row.monitoringPlotId.toString());
    return (
      <Link fontSize='16px' to={url}>
        {row.monitoringPlotNumber}
      </Link>
    );
  }, []);

  const TextCell = useCallback(({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => {
    const value = cell.getValue() as string | undefined;
    return value !== undefined && value !== null ? <p style={{ margin: 0 }}>{value}</p> : null;
  }, []);

  const CompletedDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => {
      const dateStr = cell.row.original.completedDate;
      return dateStr ? <p style={{ margin: 0 }}>{getDateDisplayValue(dateStr, timeZone)}</p> : null;
    },
    [timeZone]
  );

  const NumberCell = useCallback(({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => {
    const value = cell.getValue() as number | undefined;
    const row = cell.row.original;
    const columnId = cell.column.id as keyof MonitoringPlotRow;
    const NO_DATA_FIELDS: (keyof MonitoringPlotRow)[] = ['totalPlants', 'totalSpecies'];
    if (!row.completedDate && value === 0 && NO_DATA_FIELDS.includes(columnId)) {
      return <p style={{ margin: 0 }}>{''}</p>;
    }
    return typeof value === 'number' ? <p style={{ margin: 0 }}>{value}</p> : null;
  }, []);

  const SurvivalRateCell = useCallback(({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => {
    const value = cell.getValue() as number | undefined;
    return value !== undefined && value !== null ? (
      <p style={{ margin: 0 }}>{`${value}%`}</p>
    ) : (
      <p style={{ margin: 0 }}>{''}</p>
    );
  }, []);

  const IsPermanentCell = useCallback(({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => {
    const value = cell.getValue() as string;
    return <p style={{ margin: 0 }}>{value}</p>;
  }, []);

  const ActionsMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<MonitoringPlotRow> }) => <MonitoringPlotActionsMenuContent row={cell.row.original} />,
    []
  );

  const uniqueStatuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status).filter(Boolean))).sort(), [rows]);

  const columns = useMemo<EditableTableColumn<MonitoringPlotRow>[]>(() => {
    const defaultColumns: EditableTableColumn<MonitoringPlotRow>[] = [
      {
        id: 'monitoringPlotNumber',
        header: strings.MONITORING_PLOT,
        accessorKey: 'monitoringPlotNumber',
        filterVariant: 'range',
        Cell: PlotNumberCell,
      },
      {
        id: 'substratumName',
        header: strings.SUBSTRATUM,
        accessorKey: 'substratumName',
        filterVariant: 'text',
        Cell: TextCell,
      },
      {
        id: 'completedDate',
        header: strings.DATE,
        accessorFn: (row) => {
          const dateStr = row.completedDate;
          if (!dateStr) {
            return null;
          }
          const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (!match) {
            return null;
          }
          return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        },
        filterVariant: 'date-range',
        filterFn: makeDateRangeFilterFn<MonitoringPlotRow>('completedDate'),
        Cell: CompletedDateCell,
      },
      {
        id: 'status',
        header: strings.STATUS,
        accessorKey: 'status',
        filterVariant: 'select',
        filterSelectOptions: uniqueStatuses,
        Cell: TextCell,
      },
      {
        id: 'isPermanent',
        header: strings.MONITORING_PLOT_TYPE,
        accessorFn: (row) => (row.isPermanent === true ? strings.PERMANENT : strings.TEMPORARY),
        filterVariant: 'select',
        filterSelectOptions: [strings.PERMANENT, strings.TEMPORARY],
        Cell: IsPermanentCell,
      },
      {
        id: 'totalLive',
        header: strings.LIVE_PLANTS,
        accessorKey: 'totalLive',
        filterVariant: 'range',
        Cell: NumberCell,
      },
      {
        id: 'totalPlants',
        header: strings.TOTAL_PLANTS,
        accessorKey: 'totalPlants',
        filterVariant: 'range',
        Cell: NumberCell,
      },
      {
        id: 'totalSpecies',
        header: strings.SPECIES,
        accessorKey: 'totalSpecies',
        filterVariant: 'range',
        Cell: NumberCell,
      },
      {
        id: 'plantingDensity',
        header: strings.PLANT_DENSITY,
        accessorKey: 'plantingDensity',
        filterVariant: 'range',
        Cell: NumberCell,
      },
      {
        id: 'survivalRate',
        header: strings.SURVIVAL_RATE,
        accessorKey: 'survivalRate',
        filterVariant: 'range',
        Cell: SurvivalRateCell,
      },
    ];

    if (replaceObservationPlotEnabled) {
      return [
        ...defaultColumns,
        {
          id: 'actionsMenu',
          header: '',
          accessorFn: () => null,
          enableHiding: false,
          Cell: ActionsMenuCell,
        },
      ];
    }

    return defaultColumns;
  }, [
    strings,
    uniqueStatuses,
    replaceObservationPlotEnabled,
    PlotNumberCell,
    TextCell,
    CompletedDateCell,
    NumberCell,
    SurvivalRateCell,
    IsPermanentCell,
    ActionsMenuCell,
  ]);

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <EditableTable
        key='observation-stratum-monitoring-plot-table'
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={rows}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={true}
        storageKey={STORAGE_KEY}
        enablePagination={false}
        enableTopToolbar={true}
        enableBottomToolbar={false}
        initialSorting={[{ id: 'monitoringPlotNumber', desc: false }]}
        renderToolbarInternalActions={({ table }) => (
          <Box display='flex' gap={0.5}>
            <MRT_ToggleGlobalFilterButton table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            <MRT_ToggleFullScreenButton table={table} />
          </Box>
        )}
        tableOptions={{
          defaultColumn: { enableEditing: false },
          state: {
            columnFilters,
            columnOrder,
            columnVisibility,
            density,
            showColumnFilters,
            showGlobalFilter,
            isLoading,
          },
          onColumnFiltersChange: setColumnFilters,
          onColumnOrderChange: setColumnOrder,
          onColumnVisibilityChange: setColumnVisibility,
          onDensityChange,
          onShowColumnFiltersChange: setShowColumnFilters,
          onShowGlobalFilterChange: setShowGlobalFilter,
          enableColumnPinning: true,
          enableColumnActions: true,
          enableHiding: true,
          enableGrouping: false,
          enableColumnDragging: true,
          positionGlobalFilter: 'right',
          muiTableBodyRowProps: ({ row }: { row: MRT_Row<MonitoringPlotRow> }) => ({
            id: `row${row.index + 1}`,
            sx: {
              '& td': { borderBottom: 'none' },
            },
          }),
          muiTableBodyCellProps: ({ row, column }) => ({
            id: `row${row.index + 1}-${column.id}`,
          }),
          muiTableBodyProps: {
            sx: {
              '& tr:nth-of-type(odd) > td': {
                backgroundColor: theme.palette.TwClrBaseGray025,
              },
            },
          },
          muiTablePaperProps: { elevation: 0 },
          muiTopToolbarProps: {
            sx: {
              position: 'relative',
              '& > .MuiBox-root': { position: 'relative' },
              '& .Mui-ToolbarDropZone': { display: 'none' },
            },
          },
          muiTableHeadCellProps: ({ column }) =>
            column.id === 'actionsMenu' ? { sx: { '& .Mui-TableHeadCell-Content': { display: 'none' } } } : {},
        }}
        sx={{ padding: 0 }}
      />
    </Card>
  );
}
