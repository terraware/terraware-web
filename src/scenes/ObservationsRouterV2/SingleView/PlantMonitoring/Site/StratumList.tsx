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

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useTableState from 'src/hooks/useTableState';
import { useLocalization } from 'src/providers/hooks';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const STORAGE_KEY = 'observation-site-stratum-table';

type StratumRow = {
  observationId: number;
  stratumName: string;
  completedDate?: string;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
};

export default function StratumList(): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone().get().id;
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

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

  useEffect(() => {
    if (observationResultsResponse) {
      void getPlantingSite(observationResultsResponse.observation.plantingSiteId, true);
    }
  }, [getPlantingSite, observationResultsResponse]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);
  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone, [defaultTimeZone, plantingSite?.timeZone]);

  const rows = useMemo((): StratumRow[] => {
    if (observationResultsResponse) {
      return observationResultsResponse.observation.strata.map((stratum): StratumRow => {
        const totalLive = stratum.species.reduce((total, plotSpecies) => total + plotSpecies.totalLive, 0);
        return {
          observationId: observationResultsResponse.observation.observationId,
          stratumName: stratum.name,
          completedDate: stratum.completedTime ? getDateDisplayValue(stratum.completedTime, timeZone) : undefined,
          totalLive,
          totalPlants: stratum.totalPlants,
          totalSpecies: stratum.totalSpecies,
          plantingDensity: stratum.plantingDensity,
          survivalRate: stratum.survivalRate,
        };
      });
    } else {
      return [];
    }
  }, [observationResultsResponse, timeZone]);

  const StratumNameCell = useCallback(({ cell }: { cell: MRT_Cell<StratumRow> }) => {
    const row = cell.row.original;
    const url = APP_PATHS.OBSERVATION_STRATUM_DETAILS_V2.replace(
      ':observationId',
      row.observationId.toString()
    ).replace(':stratumName', row.stratumName);
    return (
      <Link fontSize='16px' to={url}>
        {row.stratumName}
      </Link>
    );
  }, []);

  const NumberCell = useCallback(({ cell }: { cell: MRT_Cell<StratumRow> }) => {
    const value = cell.getValue() as number | undefined;
    const row = cell.row.original;
    const columnId = cell.column.id as keyof StratumRow;
    const NO_DATA_FIELDS: (keyof StratumRow)[] = ['totalPlants', 'totalSpecies'];
    if (!row.completedDate && value === 0 && NO_DATA_FIELDS.includes(columnId)) {
      return <p style={{ margin: 0 }}>{''}</p>;
    }
    return typeof value === 'number' ? <p style={{ margin: 0 }}>{value}</p> : null;
  }, []);

  const SurvivalRateCell = useCallback(({ cell }: { cell: MRT_Cell<StratumRow> }) => {
    const value = cell.getValue() as number | undefined;
    return value !== undefined && value !== null ? (
      <p style={{ margin: 0 }}>{`${value}%`}</p>
    ) : (
      <p style={{ margin: 0 }}>{''}</p>
    );
  }, []);

  const columns = useMemo<EditableTableColumn<StratumRow>[]>(
    () => [
      {
        id: 'stratumName',
        header: strings.STRATUM,
        accessorKey: 'stratumName',
        filterVariant: 'text',
        Cell: StratumNameCell,
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
    ],
    [strings, StratumNameCell, NumberCell, SurvivalRateCell]
  );

  return (
    <EditableTable
        key='observation-site-stratum-table'
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
        initialSorting={[{ id: 'stratumName', desc: false }]}
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
          muiTableBodyRowProps: ({ row }: { row: MRT_Row<StratumRow> }) => ({
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
        }}
        sx={{ padding: 0 }}
      />
  );
}
