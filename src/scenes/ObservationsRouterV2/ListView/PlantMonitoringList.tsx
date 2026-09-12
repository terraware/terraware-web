import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { Dropdown, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
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
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import { useLazyGetAllT0SiteDataSetQuery } from 'src/queries/generated/t0';
import { useLazyGetPlotsWithObservationsQuery } from 'src/queries/search/t0';
import { AdHocObservationResults, ObservationState, getStatus } from 'src/types/Observations';
import { MultiPolygon } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';
import { isAdmin } from 'src/utils/organization';
import { makeDateRangeFilterFn } from 'src/utils/tableFilters';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import { useAbandonObservationModal } from '../Abandon';
import { exportAdHocObservationsResults } from '../exportAdHocObservations';
import useFilteredObservationResults from '../useFilteredObservationResults';
import useObservationExports from '../useObservationExports';
import { PlotType } from '../useObservationFilters';
import SelectObservationButton from './SelectObservationButton';

type PlantMonitoringRow = {
  adHocPlotNumber?: number;
  monitoringPlotId?: number;
  observationId: number;
  plantingSiteId: number;
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
  completedDate?: string;
};

const ASSIGNED_STORAGE_KEY = 'plant-monitoring-assigned-table';
const ADHOC_STORAGE_KEY = 'plant-monitoring-adhoc-table';

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
  // The new filters put the plot type toggle in the page header, so the in-table selector is only
  // rendered when a handler is passed.
  onPlotTypeChange?: (plotType: PlotType) => void;
  plantingSiteId?: PlantingSiteId;
  plotType: PlotType;
};

const PlantMonitoringList = ({ onPlotTypeChange, plantingSiteId, plotType }: PlantMonitoringListProps) => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const { activeLocale, strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();

  const isAdHoc = plotType === 'adHoc';
  const newFiltersEnabled = isEnabled('New Observation Filters');
  // One observation cannot be shown on a map of every site, so the map link needs a single site.
  const showSelectObservation = newFiltersEnabled && typeof plantingSiteId === 'number';

  const assignedTableState = useTableState(ASSIGNED_STORAGE_KEY, { persistFilters: true });
  const adHocTableState = useTableState(ADHOC_STORAGE_KEY, { persistFilters: true });

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const { isLoading, observations: observationResults } = useFilteredObservationResults({
    observationType: 'Monitoring',
    plantingSiteId,
    plotType,
  });
  const [getT0SiteDataSet, getT0SiteDataSetResponse] = useLazyGetAllT0SiteDataSetQuery();
  const [getPlotsWithObservations, getPlotsWithObservationsResponse] = useLazyGetPlotsWithObservationsQuery();

  const survivalRateSet = useMemo(() => getT0SiteDataSetResponse.data?.allSet, [getT0SiteDataSetResponse.data?.allSet]);
  const plotsWithObservations = useMemo(
    () => getPlotsWithObservationsResponse.data ?? [],
    [getPlotsWithObservationsResponse.data]
  );

  const plantingSitesById = useMemo(
    () =>
      plantingSites.reduce(
        (sites, site) => {
          sites[site.id] = site;
          return sites;
        },
        {} as { [siteId: number]: PlantingSitePayload }
      ),
    [plantingSites]
  );

  useEffect(() => {
    if (typeof plantingSiteId === 'number') {
      void getT0SiteDataSet(plantingSiteId, true);
      void getPlotsWithObservations(plantingSiteId, true);
    }
  }, [getPlotsWithObservations, getT0SiteDataSet, plantingSiteId]);

  const rows = useMemo(
    () =>
      observationResults.map((observationResult): PlantMonitoringRow => {
        const plantingSite = plantingSitesById[observationResult.plantingSiteId];

        const strataNames = observationResult.strata
          .map((stratumResult) => {
            const observedStratum = plantingSite?.strata?.find((stratum) => stratum.id === stratumResult.stratumId);
            return observedStratum?.name;
          })
          .filter((stratumName): stratumName is string => stratumName !== undefined);

        const completedDate = observationResult.completedTime ?? undefined;
        const observationDate = completedDate ?? observationResult.startDate;
        const adHocPlot = observationResult.adHocPlot;
        const species = isAdHoc ? adHocPlot?.species ?? [] : observationResult.species;
        const totalLive =
          species.length > 0
            ? species.reduce((total, plantSpecies) => (total += plantSpecies.totalLive), 0)
            : undefined;

        const totalPlants = isAdHoc ? adHocPlot?.totalPlants ?? 0 : observationResult.totalPlants;
        const totalSpecies = isAdHoc ? adHocPlot?.totalSpecies ?? 0 : observationResult.totalSpecies;

        return {
          adHocPlotNumber: observationResult.adHocPlot?.monitoringPlotNumber,
          monitoringPlotId: observationResult.adHocPlot?.monitoringPlotId,
          observationId: observationResult.observationId,
          plantingSiteId: observationResult.plantingSiteId,
          observationDate,
          observationState: observationResult.state,
          state: getStatus(observationResult.state, strings),
          plantingSiteName: plantingSite?.name,
          strata: strataNames.join('\r'),
          totalLive,
          totalPlants,
          totalSpecies,
          plantingDensity: observationResult.observedDensity,
          survivalRate: observationResult.survivalRate,
          completedDate,
        };
      }),
    [isAdHoc, observationResults, plantingSitesById, strings]
  );

  const uniqueStatuses = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.state)))
        .filter(Boolean)
        .sort(),
    [rows]
  );

  const uniquePlantingSiteNames = useMemo(
    () => Array.from(new Set(rows.map((r) => r.plantingSiteName).filter((n): n is string => !!n))).sort(),
    [rows]
  );

  const navigateToSurvivalRateSettings = useCallback(() => {
    if (typeof plantingSiteId === 'number') {
      navigate({
        pathname: APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', plantingSiteId.toString()),
      });
    }
  }, [navigate, plantingSiteId]);

  // Cell components
  const ObservationDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
      const row = cell.row.original;
      const url = APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', row.observationId.toString());
      return (
        <Box alignItems='center' display='flex' gap={1}>
          <Link fontSize='16px' to={url}>
            {row.observationDate ? getShortDate(row.observationDate, activeLocale) : null}
          </Link>
          {showSelectObservation && <SelectObservationButton observationId={row.observationId} />}
        </Box>
      );
    },
    [activeLocale, showSelectObservation]
  );

  const AdHocPlotNumberCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
      const row = cell.row.original;
      const url = APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', row.observationId.toString());
      return (
        <Box alignItems='center' display='flex' gap={1}>
          <Link fontSize='16px' to={url}>
            {row.adHocPlotNumber}
          </Link>
          {showSelectObservation && row.monitoringPlotId !== undefined && (
            <SelectObservationButton
              adHocPlot={{ monitoringPlotId: row.monitoringPlotId, plantingSiteId: row.plantingSiteId }}
              observationId={row.observationId}
            />
          )}
        </Box>
      );
    },
    [showSelectObservation]
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

  const CompletedDateCell = useCallback(({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => {
    const dateStr = cell.row.original.completedDate;
    return dateStr ? <span>{dateStr.substring(0, 10)}</span> : null;
  }, []);

  const ActionsMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<PlantMonitoringRow> }) => <PlantMonitoringActionsMenuContent row={cell.row.original} />,
    []
  );

  const assignedColumns = useMemo((): EditableTableColumn<PlantMonitoringRow>[] => {
    const baseColumns: EditableTableColumn<PlantMonitoringRow>[] = [
      {
        id: 'observationDate',
        header: strings.DATE,
        size: showSelectObservation ? 230 : 180,
        accessorFn: (row) => {
          const dateStr = row.observationDate;
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
        filterFn: makeDateRangeFilterFn<PlantMonitoringRow>('observationDate'),
        Cell: ObservationDateCell,
      },
      {
        id: 'state',
        header: strings.STATUS,
        accessorKey: 'state',
        filterVariant: 'select',
        filterSelectOptions: uniqueStatuses,
      },
      {
        id: 'plantingSiteName',
        header: strings.PLANTING_SITE,
        accessorKey: 'plantingSiteName',
        filterVariant: 'select',
        filterSelectOptions: uniquePlantingSiteNames,
      },
      {
        id: 'strata',
        header: strings.STRATA,
        accessorKey: 'strata',
        filterVariant: 'text',
        Cell: StrataCell,
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
      },
      {
        id: 'completedDate',
        header: strings.DATE_OBSERVED,
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
        filterFn: makeDateRangeFilterFn<PlantMonitoringRow>('completedDate'),
        Cell: CompletedDateCell,
      },
    ];

    if (scheduleObservationsEnabled) {
      return [
        ...baseColumns,
        {
          id: 'actionsMenu',
          header: '',
          accessorFn: () => null,
          enableHiding: false,
          Cell: ActionsMenuCell,
        },
      ];
    }
    return baseColumns;
  }, [
    strings,
    uniqueStatuses,
    uniquePlantingSiteNames,
    showSelectObservation,
    scheduleObservationsEnabled,
    ObservationDateCell,
    StrataCell,
    NumberCell,
    CompletedDateCell,
    ActionsMenuCell,
  ]);

  const adHocColumns = useMemo((): EditableTableColumn<PlantMonitoringRow>[] => {
    return [
      {
        id: 'adHocPlotNumber',
        header: strings.PLOT,
        accessorKey: 'adHocPlotNumber',
        filterVariant: 'range',
        size: showSelectObservation ? 160 : undefined,
        Cell: AdHocPlotNumberCell,
      },
      {
        id: 'plantingSiteName',
        header: strings.PLANTING_SITE,
        accessorKey: 'plantingSiteName',
        filterVariant: 'select',
        filterSelectOptions: uniquePlantingSiteNames,
      },
      {
        id: 'completedDate',
        header: strings.DATE_OBSERVED,
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
        filterFn: makeDateRangeFilterFn<PlantMonitoringRow>('completedDate'),
        Cell: CompletedDateCell,
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
    ];
  }, [strings, showSelectObservation, uniquePlantingSiteNames, AdHocPlotNumberCell, CompletedDateCell, NumberCell]);

  const onExportAdHocObservationResults = useCallback(() => {
    const adHocResults = observationResults.filter((observation) => observation.adHocPlot);

    if (adHocResults.length === 0) {
      return;
    }

    const adHocObservationsResults: AdHocObservationResults[] = adHocResults.map((observation) => {
      const adHocPlot = observation.adHocPlot!;
      const site = plantingSitesById[observation.plantingSiteId];
      const timeZone = site?.timeZone ?? defaultTimezone;

      return {
        ...observation,
        adHocPlot,
        boundary: adHocPlot.boundary as unknown as MultiPolygon,
        plantingSiteName: site?.name ?? '',
        strata: observation.strata as AdHocObservationResults['strata'],
        timeZone,
        totalLive: observation.species.reduce((total, s) => total + s.totalLive, 0),
        totalPlants: observation.totalPlants,
      };
    });

    const selectedSite = typeof plantingSiteId === 'number' ? plantingSitesById[plantingSiteId] : undefined;
    void exportAdHocObservationsResults({ adHocObservationsResults, plantingSite: selectedSite });
  }, [defaultTimezone, observationResults, plantingSiteId, plantingSitesById]);

  const plotSelectionToolbar = useMemo(
    () => (
      <Box display='flex' flexDirection='row' alignItems='center' gap={1}>
        {onPlotTypeChange && (
          <>
            <Typography fontSize='16px' fontWeight={500}>
              {strings.PLOT_SELECTION}
            </Typography>
            <Dropdown
              id='plot-selection-selector'
              onChange={(newValue) => onPlotTypeChange(newValue as PlotType)}
              options={[
                { label: strings.ASSIGNED, value: 'assigned' },
                { label: strings.AD_HOC, value: 'adHoc' },
              ]}
              selectedValue={plotType}
              selectStyles={{
                inputContainer: { maxWidth: '160px' },
                optionsContainer: { maxWidth: '160px' },
              }}
              fixedMenu
              fullWidth
            />
          </>
        )}
        {typeof plantingSiteId === 'number' && !isAdHoc && rows.length > 0 && (
          <Box display='flex' alignItems='center'>
            <Link
              onClick={navigateToSurvivalRateSettings}
              fontSize='16px'
              style={{
                paddingLeft: isMobile ? 0 : theme.spacing(2),
                paddingRight: theme.spacing(0.5),
                paddingTop: isMobile ? theme.spacing(1) : 0,
              }}
              disabled={plotsWithObservations.length === 0}
            >
              {strings.SURVIVAL_RATE_SETTINGS}
            </Link>
            {!!plotsWithObservations.length && (
              <>
                {survivalRateSet ? (
                  <Icon name='success' fillColor={theme.palette.TwClrBgSuccess} />
                ) : (
                  <Icon name='iconUnavailable' fillColor={theme.palette.TwClrBgDanger} />
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    ),
    [
      isAdHoc,
      isMobile,
      navigateToSurvivalRateSettings,
      onPlotTypeChange,
      plantingSiteId,
      plotsWithObservations.length,
      plotType,
      rows.length,
      strings.AD_HOC,
      strings.ASSIGNED,
      strings.PLOT_SELECTION,
      strings.SURVIVAL_RATE_SETTINGS,
      survivalRateSet,
      theme,
    ]
  );

  const commonTableOptions = useMemo(
    () => ({
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
    [theme]
  );

  if (!isLoading && rows.length === 0) {
    return (
      <Card radius={'8px'} style={{ width: '100%' }}>
        {plotSelectionToolbar}
        <EmptyStateContent
          title={''}
          subtitle={
            isAdHoc
              ? [strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_2]
              : [strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2]
          }
        />
      </Card>
    );
  }

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      {!isAdHoc && (
        <EditableTable
          key='assigned-plant-monitoring-table'
          clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
          columns={assignedColumns}
          data={rows}
          enableEditing={false}
          enableSorting={true}
          enableGlobalFilter={true}
          enableColumnFilters={true}
          enableColumnOrdering={true}
          storageKey={ASSIGNED_STORAGE_KEY}
          enablePagination={false}
          enableTopToolbar={true}
          enableBottomToolbar={false}
          initialSorting={[{ id: 'observationDate', desc: true }]}
          tableOptions={{
            ...commonTableOptions,
            state: {
              columnFilters: assignedTableState.columnFilters,
              columnOrder: assignedTableState.columnOrder,
              columnVisibility: assignedTableState.columnVisibility,
              density: assignedTableState.density,
              showColumnFilters: assignedTableState.showColumnFilters,
              showGlobalFilter: assignedTableState.showGlobalFilter,
              isLoading,
            },
            onColumnFiltersChange: assignedTableState.setColumnFilters,
            onColumnOrderChange: assignedTableState.setColumnOrder,
            onColumnVisibilityChange: assignedTableState.setColumnVisibility,
            onDensityChange: assignedTableState.onDensityChange,
            onShowColumnFiltersChange: assignedTableState.setShowColumnFilters,
            onShowGlobalFilterChange: assignedTableState.setShowGlobalFilter,
            renderTopToolbarCustomActions: () => plotSelectionToolbar,
            renderToolbarInternalActions: ({ table }) => (
              <Box display='flex' gap={0.5}>
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
              </Box>
            ),
          }}
          sx={{ padding: 0 }}
        />
      )}
      {isAdHoc && (
        <EditableTable
          key='ad-hoc-plant-monitoring-table'
          clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
          columns={adHocColumns}
          data={rows}
          enableEditing={false}
          enableSorting={true}
          enableGlobalFilter={true}
          enableColumnFilters={true}
          enableColumnOrdering={true}
          storageKey={ADHOC_STORAGE_KEY}
          enablePagination={false}
          enableTopToolbar={true}
          enableBottomToolbar={false}
          initialSorting={[{ id: 'adHocPlotNumber', desc: false }]}
          tableOptions={{
            ...commonTableOptions,
            state: {
              columnFilters: adHocTableState.columnFilters,
              columnOrder: adHocTableState.columnOrder,
              columnVisibility: adHocTableState.columnVisibility,
              density: adHocTableState.density,
              showColumnFilters: adHocTableState.showColumnFilters,
              showGlobalFilter: adHocTableState.showGlobalFilter,
              isLoading,
            },
            onColumnFiltersChange: adHocTableState.setColumnFilters,
            onColumnOrderChange: adHocTableState.setColumnOrder,
            onColumnVisibilityChange: adHocTableState.setColumnVisibility,
            onDensityChange: adHocTableState.onDensityChange,
            onShowColumnFiltersChange: adHocTableState.setShowColumnFilters,
            onShowGlobalFilterChange: adHocTableState.setShowGlobalFilter,
            renderTopToolbarCustomActions: () => plotSelectionToolbar,
            renderToolbarInternalActions: ({ table }) => (
              <Box display='flex' gap={0.5}>
                {rows.length > 0 && (
                  <Tooltip title={strings.EXPORT}>
                    <IconButton onClick={onExportAdHocObservationResults}>
                      <Icon name='iconExport' size='medium' />
                    </IconButton>
                  </Tooltip>
                )}
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
              </Box>
            ),
          }}
          sx={{ padding: 0 }}
        />
      )}
    </Card>
  );
};

export default PlantMonitoringList;
