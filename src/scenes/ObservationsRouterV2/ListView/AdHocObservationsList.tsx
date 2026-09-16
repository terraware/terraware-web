import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import {
  MRT_Cell,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import useTableState from 'src/hooks/useTableState';
import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { AdHocObservationResults } from 'src/types/Observations';
import { MultiPolygon } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import { useObservationFilters } from '../ObservationFiltersProvider';
import useFilteredObservationResults from '../useFilteredObservationResults';
import useObservationExports from '../useObservationExports';
import { BiomassActionsMenuContent } from './BiomassList';
import SelectObservationButton from './SelectObservationButton';

const STORAGE_KEY = 'ad-hoc-observations-table';

type AdHocRow = {
  completedDate?: string;
  isBiomass: boolean;
  liveTrees?: number;
  monitoringPlotId?: number;
  monitoringPlotNumber?: number;
  observationId: number;
  plantingSiteId: number;
  plantingSiteName?: string;
  plotDescription?: string;
  totalPlants?: number;
  totalSpecies?: number;
};

const toRow = (observation: ObservationResultsPayload, plantingSiteName?: string): AdHocRow => {
  const biomass = observation.biomassMeasurements;
  const adHocPlot = observation.adHocPlot;

  return {
    completedDate: observation.completedTime,
    isBiomass: observation.type === 'Biomass Measurements',
    liveTrees: biomass
      ? biomass.trees.filter((tree) => !tree.isDead).length
      : (adHocPlot?.species ?? []).reduce((total, species) => total + species.totalLive, 0),
    monitoringPlotId: adHocPlot?.monitoringPlotId,
    monitoringPlotNumber: adHocPlot?.monitoringPlotNumber,
    observationId: observation.observationId,
    plantingSiteId: observation.plantingSiteId,
    plantingSiteName,
    plotDescription: biomass?.description,
    totalPlants: biomass ? biomass.trees.length : adHocPlot?.totalPlants,
    totalSpecies: biomass ? biomass.treeSpeciesCount : adHocPlot?.totalSpecies,
  };
};

export type AdHocObservationsListProps = {
  plantingSiteId?: PlantingSiteId;
};

const AdHocObservationsList = ({ plantingSiteId }: AdHocObservationsListProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { observationType } = useObservationFilters();
  const { downloadAdHocObservationsZip } = useObservationExports();
  const tableState = useTableState(STORAGE_KEY);

  const { isFetching: isLoading, observations } = useFilteredObservationResults({
    observationType,
    plantingSiteId,
    plotType: 'adHoc',
  });

  const { plantingSites } = useOrganizationPlantingSites();

  const plantingSitesById = useMemo(
    () =>
      plantingSites.reduce(
        (sites, site) => {
          sites[site.id] = site;
          return sites;
        },
        {} as { [siteId: number]: (typeof plantingSites)[number] }
      ),
    [plantingSites]
  );

  const plantingSiteNames = useMemo(
    () =>
      plantingSites.reduce(
        (names, site) => {
          names[site.id] = site.name;
          return names;
        },
        {} as { [siteId: number]: string }
      ),
    [plantingSites]
  );

  const rows = useMemo(
    () =>
      observations
        .filter((observation) => observation.type !== 'Biomass Measurements' || observation.biomassMeasurements)
        .map((observation) => toRow(observation, plantingSiteNames[observation.plantingSiteId])),
    [observations, plantingSiteNames]
  );

  const showSelectObservation = typeof plantingSiteId === 'number';

  const PlotNumberCell = useCallback(
    ({ cell }: { cell: MRT_Cell<AdHocRow> }) => {
      const row = cell.row.original;
      const url = APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', row.observationId.toString());
      return (
        <Box alignItems='center' display='flex' gap={1}>
          <Link fontSize='16px' to={url}>
            {row.monitoringPlotNumber}
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

  const CompletedDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<AdHocRow> }) => {
      const dateStr = cell.row.original.completedDate;
      return dateStr ? <span>{getDateDisplayValue(dateStr, defaultTimezone)}</span> : null;
    },
    [defaultTimezone]
  );

  const NumberCell = useCallback(({ cell }: { cell: MRT_Cell<AdHocRow> }) => {
    const value = cell.getValue() as number | undefined;
    return typeof value === 'number' ? <FormattedNumber value={value} /> : null;
  }, []);

  const ActionsMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<AdHocRow> }) =>
      cell.row.original.isBiomass ? (
        <BiomassActionsMenuContent observationId={cell.row.original.observationId} />
      ) : null,
    []
  );

  const columns = useMemo(
    (): EditableTableColumn<AdHocRow>[] => [
      {
        id: 'monitoringPlotNumber',
        header: strings.PLOT,
        accessorKey: 'monitoringPlotNumber',
        size: showSelectObservation ? 160 : undefined,
        Cell: PlotNumberCell,
      },
      {
        id: 'plotDescription',
        header: strings.PLOT_DESCRIPTION,
        accessorKey: 'plotDescription',
      },
      {
        id: 'plantingSiteName',
        header: strings.PLANTING_SITE,
        accessorKey: 'plantingSiteName',
      },
      {
        id: 'completedDate',
        header: strings.DATE_OBSERVED,
        accessorKey: 'completedDate',
        Cell: CompletedDateCell,
      },
      {
        id: 'liveTrees',
        header: strings.LIVE_TREES_RECORDED,
        accessorKey: 'liveTrees',
        Cell: NumberCell,
      },
      {
        id: 'totalPlants',
        header: strings.TOTAL_PLANTS,
        accessorKey: 'totalPlants',
        Cell: NumberCell,
      },
      {
        id: 'totalSpecies',
        header: strings.SPECIES,
        accessorKey: 'totalSpecies',
        Cell: NumberCell,
      },
      {
        id: 'actionsMenu',
        header: '',
        accessorFn: () => null,
        enableHiding: false,
        Cell: ActionsMenuCell,
      },
    ],
    [strings, showSelectObservation, PlotNumberCell, CompletedDateCell, NumberCell, ActionsMenuCell]
  );

  // Both kinds of ad-hoc observation can be in view at once, so each gets a file in one zip.
  const onExport = useCallback(async () => {
    const siteName =
      typeof plantingSiteId === 'number'
        ? plantingSiteNames[plantingSiteId] ?? strings.ALL_PLANTING_SITES
        : strings.ALL_PLANTING_SITES;

    const monitoringResults = observations
      .filter((observation) => observation.type !== 'Biomass Measurements' && observation.adHocPlot)
      .map((observation): AdHocObservationResults => {
        const adHocPlot = observation.adHocPlot!;
        const site = plantingSitesById[observation.plantingSiteId];

        return {
          ...observation,
          adHocPlot,
          boundary: adHocPlot.boundary as unknown as MultiPolygon,
          plantingSiteName: site?.name ?? '',
          strata: observation.strata as AdHocObservationResults['strata'],
          timeZone: site?.timeZone ?? defaultTimezone,
          totalLive: observation.species.reduce((total, species) => total + species.totalLive, 0),
          totalPlants: observation.totalPlants,
        };
      });

    const biomassObservationIds = observations
      .filter((observation) => observation.type === 'Biomass Measurements')
      .map((observation) => observation.observationId);

    await downloadAdHocObservationsZip({
      adHocObservationsResults: monitoringResults,
      biomassObservationIds,
      plantingSiteId: plantingSiteId === ALL_PLANTING_SITES ? undefined : plantingSiteId,
      siteName,
    });
  }, [
    defaultTimezone,
    downloadAdHocObservationsZip,
    observations,
    plantingSiteId,
    plantingSiteNames,
    plantingSitesById,
    strings.ALL_PLANTING_SITES,
  ]);

  if (!isLoading && rows.length === 0) {
    return (
      <Card radius={'8px'} style={{ width: '100%' }}>
        <EmptyStateContent
          title={''}
          subtitle={[
            strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_1,
            strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_2,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <EditableTable<AdHocRow>
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={rows}
        enableBottomToolbar={false}
        enableColumnFilters={false}
        enableColumnOrdering
        enableEditing={false}
        enableGlobalFilter
        enablePagination={false}
        enableSorting
        enableTopToolbar
        initialSorting={[{ id: 'completedDate', desc: true }]}
        storageKey={STORAGE_KEY}
        sx={{ padding: 0 }}
        tableOptions={{
          defaultColumn: { enableEditing: false },
          enableColumnActions: true,
          enableColumnDragging: true,
          enableColumnPinning: true,
          enableGrouping: false,
          enableHiding: true,
          muiTableBodyProps: {
            sx: {
              '& tr:nth-of-type(odd) > td': {
                backgroundColor: theme.palette.TwClrBaseGray025,
              },
            },
          },
          muiTableBodyRowProps: ({ row }: { row: MRT_Row<AdHocRow> }) => ({
            id: `row${row.index + 1}`,
            sx: {
              '& td': {
                borderBottom: 'none',
              },
            },
          }),
          muiTableHeadCellProps: ({ column }: { column: { id: string } }) =>
            column.id === 'actionsMenu' ? { sx: { '& .Mui-TableHeadCell-Content': { display: 'none' } } } : {},
          muiTablePaperProps: { elevation: 0 },
          positionGlobalFilter: 'right' as const,
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
              {rows.length > 0 && (
                <Tooltip title={strings.EXPORT}>
                  <IconButton onClick={() => void onExport()}>
                    <Icon name='iconExport' size='medium' />
                  </IconButton>
                </Tooltip>
              )}
              <MRT_ToggleGlobalFilterButton table={table} />
              <MRT_ShowHideColumnsButton table={table} />
              <MRT_ToggleDensePaddingButton table={table} />
              <MRT_ToggleFullScreenButton table={table} />
            </Box>
          ),
        }}
      />
    </Card>
  );
};

export default AdHocObservationsList;
