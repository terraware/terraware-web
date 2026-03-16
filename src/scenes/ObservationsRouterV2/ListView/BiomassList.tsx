import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import {
  MRT_Cell,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';
import sanitize from 'sanitize-filename';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useLazyListAdHocObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { ObservationsService } from 'src/services';
import { downloadCsv } from 'src/utils/csv';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import useObservationExports from '../useObservationExports';

const STORAGE_KEY = 'biomass-measurement-table';

type BiomassRow = {
  observationId: number;
  monitoringPlotNumber?: number;
  monitoringPlotDescription?: string;
  plantingSiteId: number;
  plantingSiteName?: string;
  completedDate?: string;
  totalPlants?: number;
  totalSpecies?: number;
};

const BiomassActionsMenuContent = ({ observationId }: { observationId: number }): JSX.Element => {
  const { strings } = useLocalization();
  const { downloadBiomassObservationDetails } = useObservationExports();
  return (
    <TableRowPopupMenu
      menuItems={[
        {
          disabled: false,
          label: strings.EXPORT_BIOMASS_MONITORING_DETAILS_CSV,
          onClick: () => void downloadBiomassObservationDetails(observationId),
        },
      ]}
    />
  );
};

export type BiomassListProps = {
  plantingSiteId?: number;
};

export default function BiomassList({ plantingSiteId }: BiomassListProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const defaultTimezone = useDefaultTimeZone().get().id;

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

  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();
  const [listAdHocObservationResults, adHocObservationsResultsResponse] = useLazyListAdHocObservationResultsQuery();

  const plantingSitesNames = useMemo(
    () =>
      (listPlantingSitesResult.data?.sites ?? []).reduce(
        (siteNames, site) => {
          siteNames[site.id] = site.name;
          return siteNames;
        },
        {} as { [siteId: number]: string }
      ),
    [listPlantingSitesResult.data]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id }, true);
      void listAdHocObservationResults(
        { plantingSiteId, organizationId: selectedOrganization.id, includePlants: true },
        true
      );
    }
  }, [listAdHocObservationResults, listPlantingSites, selectedOrganization, plantingSiteId]);

  const rows = useMemo((): BiomassRow[] => {
    if (adHocObservationsResultsResponse.isSuccess) {
      return adHocObservationsResultsResponse.data.observations
        .filter(
          (observation) =>
            observation.type === 'Biomass Measurements' &&
            observation.biomassMeasurements &&
            observation.state !== 'Upcoming'
        )
        .map((observation) => ({
          observationId: observation.observationId,
          monitoringPlotNumber: observation.adHocPlot?.monitoringPlotNumber,
          monitoringPlotDescription: observation.biomassMeasurements?.description,
          plantingSiteId: observation.plantingSiteId,
          plantingSiteName: plantingSitesNames[observation.plantingSiteId],
          completedDate: observation.completedTime,
          totalPlants: observation.biomassMeasurements?.trees.length,
          totalSpecies: observation.biomassMeasurements?.treeSpeciesCount,
        }));
    } else {
      return [];
    }
  }, [adHocObservationsResultsResponse, plantingSitesNames]);

  const uniquePlantingSiteNames = useMemo(
    () => Array.from(new Set(rows.map((r) => r.plantingSiteName).filter((n): n is string => !!n))).sort(),
    [rows]
  );

  const PlotNumberCell = useCallback(({ cell }: { cell: MRT_Cell<BiomassRow> }) => {
    const row = cell.row.original;
    const url = APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', row.observationId.toString());
    return (
      <Link fontSize='16px' to={url}>
        {row.monitoringPlotNumber}
      </Link>
    );
  }, []);

  const CompletedDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<BiomassRow> }) => {
      const dateStr = cell.row.original.completedDate;
      return dateStr ? <span>{getDateDisplayValue(dateStr, defaultTimezone)}</span> : null;
    },
    [defaultTimezone]
  );

  const ActionsMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<BiomassRow> }) => (
      <BiomassActionsMenuContent observationId={cell.row.original.observationId} />
    ),
    []
  );

  const columns = useMemo<EditableTableColumn<BiomassRow>[]>(
    () => [
      {
        id: 'monitoringPlotNumber',
        header: strings.PLOT,
        accessorKey: 'monitoringPlotNumber',
        enableEditing: false,
        filterVariant: 'range',
        Cell: PlotNumberCell,
      },
      {
        id: 'monitoringPlotDescription',
        header: strings.PLOT_DESCRIPTION,
        accessorKey: 'monitoringPlotDescription',
        enableEditing: false,
        filterVariant: 'text',
      },
      {
        id: 'plantingSiteName',
        header: strings.PLANTING_SITE,
        accessorKey: 'plantingSiteName',
        enableEditing: false,
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
        enableEditing: false,
        filterVariant: 'date-range',
        filterFn: (row: BiomassRow, _columnId: string, filterValue: unknown[]) => {
          const toDayStr = (val: unknown): string | null => {
            if (val === null || val === undefined) {
              return null;
            }
            if (typeof val === 'object') {
              const dayjsLike = val as { format?: (f: string) => string; isValid?: () => boolean };
              if (typeof dayjsLike.format === 'function' && typeof dayjsLike.isValid === 'function') {
                return dayjsLike.isValid() ? dayjsLike.format('YYYY-MM-DD') : null;
              }
            }
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
              return val.substring(0, 10);
            }
            return null;
          };
          const minStr = toDayStr(filterValue[0]);
          const maxStr = toDayStr(filterValue[1]);
          if (!minStr && !maxStr) {
            return true;
          }
          // row is an MRT Row wrapper at runtime; access original data via .original
          const original = (row as unknown as { original: BiomassRow }).original;
          const dateStr = original.completedDate;
          if (!dateStr) {
            return false;
          }
          const rowDateStr = dateStr.substring(0, 10);
          if (minStr && rowDateStr < minStr) {
            return false;
          }
          if (maxStr && rowDateStr > maxStr) {
            return false;
          }
          return true;
        },
        Cell: CompletedDateCell,
      },
      {
        id: 'totalPlants',
        header: strings.TOTAL_PLANTS,
        accessorKey: 'totalPlants',
        enableEditing: false,
        filterVariant: 'range',
      },
      {
        id: 'totalSpecies',
        header: strings.SPECIES,
        accessorKey: 'totalSpecies',
        enableEditing: false,
        filterVariant: 'range',
      },
      {
        id: 'actionsMenu',
        header: '',
        accessorFn: () => null,
        enableEditing: false,
        enableHiding: false,
        Cell: ActionsMenuCell,
      },
    ],
    [strings, uniquePlantingSiteNames, PlotNumberCell, CompletedDateCell, ActionsMenuCell]
  );

  const onExportBiomassObservations = useCallback(async () => {
    if (!selectedOrganization) {
      return;
    }
    const content = await ObservationsService.exportBiomassObservationsCsv(selectedOrganization.id, plantingSiteId);
    if (content !== null) {
      const siteName = plantingSiteId
        ? plantingSitesNames[plantingSiteId] ?? strings.ALL_PLANTING_SITES
        : strings.ALL_PLANTING_SITES;
      const filename = sanitize(`${siteName}-${strings.BIOMASS_MONITORING}`);
      downloadCsv(filename, content);
    }
  }, [
    plantingSiteId,
    plantingSitesNames,
    selectedOrganization,
    strings.ALL_PLANTING_SITES,
    strings.BIOMASS_MONITORING,
  ]);

  const handleExportClick = useCallback(() => {
    void onExportBiomassObservations();
  }, [onExportBiomassObservations]);

  const isLoading = useMemo(
    () => adHocObservationsResultsResponse.isFetching || listPlantingSitesResult.isFetching,
    [adHocObservationsResultsResponse.isFetching, listPlantingSitesResult.isFetching]
  );

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <EditableTable
        key='biomass-measurement-table'
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={rows}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={true}
        stickyFilters={true}
        storageKey={STORAGE_KEY}
        enablePagination={false}
        enableTopToolbar={true}
        enableBottomToolbar={false}
        initialSorting={[{ id: 'completedDate', desc: true }]}
        tableOptions={{
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
          renderEmptyRowsFallback: () => (
            <EmptyStateContent
              title={''}
              subtitle={[strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2]}
            />
          ),
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
              {rows.length > 0 && (
                <Tooltip title={strings.EXPORT}>
                  <IconButton onClick={handleExportClick}>
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
          muiTableHeadCellProps: ({ column }) =>
            column.id === 'actionsMenu' ? { sx: { '& .Mui-TableHeadCell-Content': { display: 'none' } } } : {},
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
    </Card>
  );
}
