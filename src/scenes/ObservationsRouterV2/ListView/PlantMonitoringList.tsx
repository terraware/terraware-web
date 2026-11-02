import React, { useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import PendingSurvivalRate from 'src/components/SurvivalRate/PendingSurvivalRate';
import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import usePollPendingSurvivalRates from 'src/hooks/usePollPendingSurvivalRates';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers';
import { ObservationState, getStatus } from 'src/types/Observations';
import { TABLES } from 'src/types/Tables';
import { getShortDate } from 'src/utils/dateFormatter';
import { hasPendingResults } from 'src/utils/observation';
import { isAdmin } from 'src/utils/organization';

import { useAbandonObservationModal } from '../Abandon';
import useFilteredObservationResults from '../useFilteredObservationResults';
import useObservationExports from '../useObservationExports';
import useObservationsEmptyMessage from '../useObservationsEmptyMessage';
import SelectObservationButton from './SelectObservationButton';

type PlantMonitoringRow = {
  observationId: number;
  observationDate?: string;
  observationState?: ObservationState;
  state: string;
  plantingSiteName?: string;
  strata?: string;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
  survivalRatePending?: boolean;
  completedDate?: string;
};

const TABLE = TABLES.assignedObservations;

const DEFAULT_COLUMN_ORDER = [
  'observationDate',
  'completedDate',
  'totalLive',
  'totalPlants',
  'totalSpecies',
  'plantingDensity',
  'survivalRate',
  'state',
  'plantingSiteName',
  'strata',
  'actionsMenu',
];

const DEFAULT_COLUMN_VISIBILITY = { plantingSiteName: false, state: false, strata: false };

const toLocalDate = (dateStr?: string) => {
  const match = dateStr?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

const PlantMonitoringActionsMenuContent = ({ row }: { row: PlantMonitoringRow }) => {
  const { strings } = useLocalization();
  const { openAbandonObservationModal } = useAbandonObservationModal();
  const { downloadObservationCsv, downloadObservationGpx, downloadObservationResults } = useObservationExports();
  const navigate = useSyncNavigate();

  const { observationId, observationState, state } = row;
  const exportDisabled = state === 'Upcoming';
  const rescheduleDisabled = state === 'Completed' || state === 'Abandoned';

  return (
    <TableRowPopupMenu
      menuItems={[
        {
          disabled: exportDisabled,
          label: `${strings.EXPORT_LOCATIONS} (${strings.CSV_FILE})`,
          onClick: () => {
            void downloadObservationCsv(observationId);
          },
          tooltip: exportDisabled ? strings.EXPORT_LOCATIONS_DISABLED_TOOLTIP : undefined,
        },
        {
          disabled: exportDisabled,
          label: `${strings.EXPORT_LOCATIONS} (${strings.GPX_FILE})`,
          onClick: () => {
            void downloadObservationGpx(observationId);
          },
          tooltip: exportDisabled ? strings.EXPORT_LOCATIONS_DISABLED_TOOLTIP : undefined,
        },
        {
          disabled: exportDisabled,
          label: strings.EXPORT_RESULTS,
          onClick: () => {
            void downloadObservationResults(observationId);
          },
        },
        {
          disabled: rescheduleDisabled,
          label: strings.RESCHEDULE,
          onClick: () => {
            navigate(APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observationId.toString()));
          },
        },
        {
          disabled: observationState === 'Completed' || observationState === 'Abandoned',
          label: strings.END_OBSERVATION,
          onClick: () => {
            openAbandonObservationModal(observationId);
          },
        },
      ]}
    />
  );
};

type PlantMonitoringListProps = {
  plantingSiteId?: PlantingSiteId;
};

const PlantMonitoringList = ({ plantingSiteId }: PlantMonitoringListProps) => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const { activeLocale, strings } = useLocalization();

  const showSelectObservation = typeof plantingSiteId === 'number';
  const showSiteName = plantingSiteId === ALL_PLANTING_SITES;

  const tableState = useTableState(TABLE, {
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultColumnVisibility: DEFAULT_COLUMN_VISIBILITY,
  });

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const {
    emptyState,
    isLoading,
    observations: observationResults,
  } = useFilteredObservationResults({
    observationType: 'Monitoring',
    plantingSiteId,
    plotType: 'assigned',
  });
  const emptyMessage = useObservationsEmptyMessage(emptyState);

  usePollPendingSurvivalRates(
    typeof plantingSiteId === 'number' ? plantingSiteId : undefined,
    observationResults.some(hasPendingResults)
  );

  const plantingSiteNames = useMemo(() => new Map(plantingSites.map((site) => [site.id, site.name])), [plantingSites]);

  const rows = useMemo(
    () =>
      observationResults.map((observationResult): PlantMonitoringRow => {
        const completedDate = observationResult.completedTime ?? undefined;
        const totalLive =
          observationResult.species.length > 0
            ? observationResult.species.reduce((total, plantSpecies) => total + plantSpecies.totalLive, 0)
            : undefined;

        return {
          observationId: observationResult.observationId,
          observationDate: completedDate ?? observationResult.startDate,
          observationState: observationResult.state,
          state: getStatus(observationResult.state, strings),
          plantingSiteName: plantingSiteNames.get(observationResult.plantingSiteId),
          strata: observationResult.strata.map((stratumResult) => stratumResult.name).join('\r'),
          totalLive,
          totalPlants: observationResult.totalPlants,
          totalSpecies: observationResult.totalSpecies,
          plantingDensity: observationResult.observedDensity,
          survivalRate: observationResult.survivalRate,
          survivalRatePending: observationResult.pending,
          completedDate,
        };
      }),
    [observationResults, plantingSiteNames, strings]
  );

  const ObservationDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
      const row = cell.row.original;
      const url = APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', row.observationId.toString());
      return (
        <Box>
          <Box alignItems='center' display='flex' gap={1}>
            <Link fontSize='16px' to={url}>
              {row.observationDate ? getShortDate(row.observationDate, activeLocale) : null}
            </Link>
            {showSelectObservation && <SelectObservationButton observationId={row.observationId} />}
          </Box>
          {showSiteName && (
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
              {row.plantingSiteName}
            </Typography>
          )}
        </Box>
      );
    },
    [activeLocale, showSelectObservation, showSiteName, theme]
  );

  const StrataCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
      const value = cell.row.original.strata;
      if (!value) {
        return null;
      }
      const names = value.split('\r');
      return <TextTruncated fontSize={16} stringList={names} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
    },
    [strings.TRUNCATED_TEXT_MORE_LINK]
  );

  const NumberCell = useCallback(({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
    const value = cell.getValue() as number | undefined;
    return typeof value === 'number' ? <FormattedNumber value={value} /> : null;
  }, []);

  const SurvivalRateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => (
      <PendingSurvivalRate pending={cell.row.original.survivalRatePending}>
        {cell.getValue() as number | undefined}
      </PendingSurvivalRate>
    ),
    []
  );

  const CompletedDateCell = useCallback(({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
    const dateStr = cell.row.original.completedDate;
    return dateStr ? <span>{dateStr.substring(0, 10)}</span> : null;
  }, []);

  const ActionsMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => <PlantMonitoringActionsMenuContent row={cell.row.original} />,
    []
  );

  const columns = useMemo((): EditableTableColumn<PlantMonitoringRow>[] => {
    const baseColumns: EditableTableColumn<PlantMonitoringRow>[] = [
      {
        id: 'observationDate',
        header: strings.OBSERVATION,
        size: showSelectObservation ? 230 : 180,
        accessorFn: (row) => toLocalDate(row.observationDate),
        Cell: ObservationDateCell,
      },
      { id: 'state', header: strings.STATUS, accessorKey: 'state' },
      { id: 'plantingSiteName', header: strings.PLANTING_SITE, accessorKey: 'plantingSiteName' },
      { id: 'strata', header: strings.STRATA, accessorKey: 'strata', Cell: StrataCell },
      { id: 'totalLive', header: strings.LIVE_PLANTS, accessorKey: 'totalLive', Cell: NumberCell },
      { id: 'totalPlants', header: strings.TOTAL_PLANTS, accessorKey: 'totalPlants', Cell: NumberCell },
      { id: 'totalSpecies', header: strings.SPECIES, accessorKey: 'totalSpecies', Cell: NumberCell },
      { id: 'plantingDensity', header: strings.PLANT_DENSITY, accessorKey: 'plantingDensity', Cell: NumberCell },
      { id: 'survivalRate', header: strings.SURVIVAL_RATE, accessorKey: 'survivalRate', Cell: SurvivalRateCell },
      {
        id: 'completedDate',
        header: strings.DATE_OBSERVED,
        accessorFn: (row) => toLocalDate(row.completedDate),
        Cell: CompletedDateCell,
      },
    ];

    return scheduleObservationsEnabled
      ? [
          ...baseColumns,
          {
            id: 'actionsMenu',
            header: '',
            accessorFn: () => null,
            enableHiding: false,
            Cell: ActionsMenuCell,
          },
        ]
      : baseColumns;
  }, [
    strings,
    showSelectObservation,
    scheduleObservationsEnabled,
    ObservationDateCell,
    StrataCell,
    NumberCell,
    SurvivalRateCell,
    CompletedDateCell,
    ActionsMenuCell,
  ]);

  const commonTableOptions = useMemo(
    () => ({
      renderEmptyRowsFallback: () =>
        emptyMessage ? (
          <Typography padding={theme.spacing(4)} textAlign='center'>
            {emptyMessage}
          </Typography>
        ) : null,
      defaultColumn: { enableEditing: false },
      enableColumnPinning: true,
      enableColumnActions: true,
      enableHiding: true,
      enableGrouping: false,
      enableColumnDragging: true,
      positionGlobalFilter: 'right' as const,
      muiTableBodyProps: {
        sx: {
          '& tr:nth-of-type(odd) > td': {
            backgroundColor: theme.palette.TwClrBaseGray025,
          },
        },
      },
      muiTablePaperProps: {
        elevation: 0,
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
      muiTableHeadCellProps: ({ column }: { column: { id: string } }) =>
        column.id === 'actionsMenu' ? { sx: { '& .Mui-TableHeadCell-Content': { display: 'none' } } } : {},
      muiTableBodyRowProps: ({ row }: { row: MRT_Row<PlantMonitoringRow> }) => ({
        id: `row${row.index + 1}`,
        sx: {
          '& td': {
            borderBottom: 'none',
          },
        },
      }),
    }),
    [emptyMessage, theme]
  );

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={rows}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={false}
        enableColumnOrdering={true}
        storageKey={TABLE.storageKey}
        enablePagination={false}
        enableTopToolbar={true}
        enableBottomToolbar={false}
        initialSorting={[{ id: 'observationDate', desc: true }]}
        tableOptions={{
          ...commonTableOptions,
          state: {
            columnOrder: tableState.columnOrder,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            showGlobalFilter: tableState.showGlobalFilter,
            isLoading,
          },
          onColumnOrderChange: tableState.setColumnOrder,
          onColumnVisibilityChange: tableState.setColumnVisibility,
          onDensityChange: tableState.onDensityChange,
          onShowGlobalFilterChange: tableState.setShowGlobalFilter,
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />
              <MRT_ToggleDensePaddingButton table={table} />
              <MRT_ToggleFullScreenButton table={table} />
            </Box>
          ),
        }}
        sx={{ padding: 0 }}
      />
    </Card>
  );
};

export default PlantMonitoringList;
