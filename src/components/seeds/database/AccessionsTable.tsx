import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Box, CircularProgress, IconButton, Tooltip, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ColumnFiltersState,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { ACCESSION_2_STATES } from 'src/types/Accession';
import { Project } from 'src/types/Project';
import { SearchResponseElementWithId } from 'src/types/Search';
import { makeCsv } from 'src/utils/csv';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';
import { getAllSeedBanks } from 'src/utils/organization';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { makeDateRangeFilterFn } from 'src/utils/tableFilters';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const TABLE_STATE_STORAGE_KEY = 'accessions-database-table';

const DEFAULT_VISIBLE_COLUMNS = [
  'accessionNumber',
  'speciesName',
  'project_name',
  'state',
  'collectionSiteName',
  'collectedTime',
  'ageMonths',
  'estimatedWeightGrams',
  'estimatedCount',
];

const DEFAULT_COLUMN_ORDER = [
  'accessionNumber',
  'speciesName',
  'project_name',
  'state',
  'collectionSiteName',
  'collectedTime',
  'receivedDate',
  'ageMonths',
  'estimatedWeightGrams',
  'estimatedCount',
  'facility_name',
  'subLocation_name',
  'species_commonName',
  'species_familyName',
  'collectionSiteLandowner',
  'collectionSiteNotes',
  'ageYears',
  'totalWithdrawnCount',
  'totalWithdrawnWeightMilligrams',
  'totalWithdrawnWeightGrams',
  'totalWithdrawnWeightKilograms',
  'totalWithdrawnWeightOunces',
  'totalWithdrawnWeightPounds',
  'totalViabilityPercent',
  'estimatedWeightMilligrams',
  'estimatedWeightKilograms',
  'estimatedWeightOunces',
  'estimatedWeightPounds',
  'geolocations',
  'plantId',
];

const DEFAULT_COLUMN_VISIBILITY = Object.fromEntries(
  DEFAULT_COLUMN_ORDER.filter((col) => !DEFAULT_VISIBLE_COLUMNS.includes(col)).map((col) => [col, false])
);

type AccessionsTableProps = {
  searchResults: SearchResponseElementWithId[] | null | undefined;
  projects?: Project[];
};

export default function AccessionsTable({ searchResults, projects }: AccessionsTableProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const locationTimeZone = useLocationTimeZone();
  const facilityNameToTz = useMemo(
    () =>
      Object.fromEntries(
        (selectedOrganization ? getAllSeedBanks(selectedOrganization) : []).map((sb) => [sb.name, locationTimeZone.get(sb).id])
      ),
    [selectedOrganization, locationTimeZone]
  );
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const numberFormatter = useNumberFormatter();

  const {
    columnFilters,
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    onPaginationChange,
    pagination,
    setColumnFilters,
    setColumnOrder,
    setColumnVisibility,
    setShowColumnFilters,
    setShowGlobalFilter,
    setSorting,
    showColumnFilters,
    showGlobalFilter,
    sorting,
  } = useTableState(TABLE_STATE_STORAGE_KEY, {
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultColumnVisibility: DEFAULT_COLUMN_VISIBILITY,
    defaultSorting: [{ id: 'accessionNumber', desc: false }],
    persistedMultiSelectColumnIds: ['facility_name', 'project_name', 'state', 'subLocation_name', 'speciesName'],
    persistFilters: true,
    persistSorting: true,
  });

  useEffect(() => {
    const facilityId = query.get('facilityId');
    const subLocationName = query.get('subLocationName');
    const filterState = query.get('accessions_filter_state');
    const speciesId = query.get('speciesId');

    if (!facilityId && !subLocationName && !filterState && !speciesId) {
      return;
    }

    let resolvedSpeciesName: string | undefined;
    if (speciesId) {
      if (!searchResults) {
        return;
      }
      const match = searchResults.find((r) => String(r.species_id) === speciesId);
      resolvedSpeciesName = match?.speciesName as string | undefined;
    }

    const urlFilters: MRT_ColumnFiltersState = [];

    if (subLocationName) {
      urlFilters.push({ id: 'subLocation_name', value: [subLocationName] });
      query.delete('subLocationName');
    }

    if (facilityId && selectedOrganization) {
      const seedBanks = getAllSeedBanks(selectedOrganization);
      const facility = seedBanks.find((sb) => sb?.id === parseInt(facilityId, 10));
      if (facility) {
        urlFilters.push({ id: 'facility_name', value: [facility.name] });
      }
      query.delete('facilityId');
    }

    if (filterState) {
      urlFilters.push({ id: 'state', value: [filterState] });
      query.delete('accessions_filter_state');
    }

    if (speciesId && resolvedSpeciesName) {
      urlFilters.push({ id: 'speciesName', value: [resolvedSpeciesName] });
      query.delete('speciesId');
    }

    if (urlFilters.length > 0) {
      setColumnFilters((prev) => {
        const newIds = new Set(urlFilters.map((f) => f.id));
        return [...prev.filter((f) => !newIds.has(f.id)), ...urlFilters];
      });
      setShowColumnFilters(true);
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    }
  }, [location, navigate, query, searchResults, selectedOrganization, setColumnFilters, setShowColumnFilters]);

  const uniqueStates = useMemo(() => ACCESSION_2_STATES as string[], []);

  const uniqueFacilityNames = useMemo(
    () => Array.from(new Set(searchResults?.map((r) => r.facility_name as string).filter(Boolean))).sort(),
    [searchResults]
  );

  const uniqueSubLocationNames = useMemo(
    () => Array.from(new Set(searchResults?.map((r) => r.subLocation_name as string).filter(Boolean))).sort(),
    [searchResults]
  );

  const uniqueSpeciesNames = useMemo(
    () => Array.from(new Set(searchResults?.map((r) => r.speciesName as string).filter(Boolean))).sort(),
    [searchResults]
  );

  const uniqueProjectNames = useMemo(
    () =>
      (projects || [])
        .map((p: Project) => p.name)
        .filter((name): name is string => !!name)
        .sort(),
    [projects]
  );

  const AccessionNumberCell = useCallback(({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
    const row = cell.row.original;
    const value = cell.getValue() as string;
    return (
      <Link fontSize='16px' to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(row.id))}>
        {value}
      </Link>
    );
  }, []);

  const ViabilityCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
      const value = cell.getValue() as number | undefined | null;
      return value !== undefined && value !== null ? <span>{`${numberFormatter.format(value)}%`}</span> : null;
    },
    [numberFormatter]
  );

  const NumericCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
      const value = cell.getValue() as number | undefined | null;
      return value !== undefined && value !== null ? <span>{numberFormatter.format(value)}</span> : null;
    },
    [numberFormatter]
  );

  const GeolocationCell = useCallback(({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
    const value = cell.getValue() as string;
    const list = value ? value.split(', ') : [];
    return list.length > 0 ? (
      <TextTruncated
        stringList={list}
        listSeparator={strings.LIST_SEPARATOR_SECONDARY}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    ) : null;
  }, []);

  const editableColumns = useMemo<EditableTableColumn<SearchResponseElementWithId>[]>(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'accessionNumber',
        header: strings.ACCESSION,
        accessorKey: 'accessionNumber',
        filterVariant: 'text',
        Cell: AccessionNumberCell,
      },
      {
        id: 'state',
        header: strings.STATUS,
        accessorKey: 'state',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueStates,
        filterFn: (row: SearchResponseElementWithId, columnId, filterValue: string[]) => {
          if (!filterValue.length) {
            return true;
          }
          return filterValue.includes(
            (row as unknown as { getValue: (id: string) => unknown }).getValue(columnId) as string
          );
        },
      },
      {
        id: 'facility_name',
        header: strings.SEED_BANKS,
        accessorKey: 'facility_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueFacilityNames,
      },
      {
        id: 'subLocation_name',
        header: strings.SUB_LOCATION,
        accessorKey: 'subLocation_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueSubLocationNames,
      },
      {
        id: 'speciesName',
        header: strings.SPECIES,
        accessorKey: 'speciesName',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueSpeciesNames,
      },
      {
        id: 'project_name',
        header: strings.PROJECT,
        accessorKey: 'project_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
      },
      {
        id: 'species_commonName',
        header: strings.COMMON_NAME,
        accessorKey: 'species_commonName',
        filterVariant: 'text',
      },
      {
        id: 'species_familyName',
        header: strings.FAMILY,
        accessorKey: 'species_familyName',
        filterVariant: 'text',
      },
      {
        id: 'collectedTime',
        header: strings.COLLECTION_TIME,
        accessorFn: (row) => {
          const dateTimeStr = (row as Record<string, unknown>).collectedTime as string | null;
          if (!dateTimeStr) {
            return null;
          }
          const facilityName = (row as Record<string, unknown>).facility_name as string | undefined;
          const tz = facilityName ? facilityNameToTz[facilityName] : undefined;
          return getDateTimeDisplayValue(new Date(dateTimeStr).getTime(), tz);
        },
        filterVariant: 'date-range',
        filterFn: makeDateRangeFilterFn<SearchResponseElementWithId>('collectedTime'),
        Cell: ({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
          const dateTimeStr = (cell.row.original as Record<string, unknown>).collectedTime as string | null;
          const facilityName = (cell.row.original as Record<string, unknown>).facility_name as string | undefined;
          const tz = facilityName ? facilityNameToTz[facilityName] : undefined;
          return dateTimeStr ? <span>{getDateTimeDisplayValue(new Date(dateTimeStr).getTime(), tz)}</span> : null;
        },
      },
      {
        id: 'receivedDate',
        header: strings.RECEIVED_DATE,
        accessorFn: (row) => {
          const dateStr = (row as Record<string, unknown>).receivedDate as string | null;
          if (!dateStr) {
            return null;
          }
          const [y, m, d] = dateStr.split('-').map(Number);
          return new Date(y, m - 1, d);
        },
        filterVariant: 'date-range',
        filterFn: makeDateRangeFilterFn<SearchResponseElementWithId>('receivedDate'),
        Cell: ({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
          const dateStr = (cell.row.original as Record<string, unknown>).receivedDate as string | null;
          return dateStr ? <span>{dateStr}</span> : null;
        },
      },
      {
        id: 'collectionSiteName',
        header: strings.COLLECTING_SITE,
        accessorKey: 'collectionSiteName',
        filterVariant: 'text',
      },
      {
        id: 'collectionSiteLandowner',
        header: strings.LANDOWNER,
        accessorKey: 'collectionSiteLandowner',
        filterVariant: 'text',
      },
      {
        id: 'collectionSiteNotes',
        header: strings.NOTES,
        accessorKey: 'collectionSiteNotes',
        filterVariant: 'text',
      },
      {
        id: 'ageMonths',
        header: strings.AGE_MONTHS,
        accessorFn: (row) => row['ageMonths(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'ageYears',
        header: strings.AGE_YEARS,
        accessorFn: (row) => row['ageYears(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalWithdrawnCount',
        header: strings.TOTAL_WITHDRAWN_COUNT,
        accessorFn: (row) => row['totalWithdrawnCount(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalWithdrawnWeightMilligrams',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_MILLIGRAMS,
        accessorFn: (row) => row['totalWithdrawnWeightMilligrams(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalWithdrawnWeightGrams',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_GRAMS,
        accessorFn: (row) => row['totalWithdrawnWeightGrams(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalWithdrawnWeightKilograms',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_KILOGRAMS,
        accessorFn: (row) => row['totalWithdrawnWeightKilograms(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalWithdrawnWeightOunces',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_OUNCES,
        accessorFn: (row) => row['totalWithdrawnWeightOunces(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalWithdrawnWeightPounds',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_POUNDS,
        accessorFn: (row) => row['totalWithdrawnWeightPounds(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'totalViabilityPercent',
        header: strings.VIABILITY,
        accessorFn: (row) => row['totalViabilityPercent(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: ViabilityCell,
      },
      {
        id: 'estimatedWeightMilligrams',
        header: strings.WEIGHT_MILLIGRAMS,
        accessorFn: (row) => row['estimatedWeightMilligrams(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'estimatedWeightGrams',
        header: strings.WEIGHT_GRAMS,
        accessorFn: (row) => row['estimatedWeightGrams(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'estimatedWeightKilograms',
        header: strings.WEIGHT_KILOGRAMS,
        accessorFn: (row) => row['estimatedWeightKilograms(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'estimatedWeightOunces',
        header: strings.WEIGHT_OUNCES,
        accessorFn: (row) => row['estimatedWeightOunces(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'estimatedWeightPounds',
        header: strings.WEIGHT_POUNDS,
        accessorFn: (row) => row['estimatedWeightPounds(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'estimatedCount',
        header: strings.COUNT,
        accessorFn: (row) => row['estimatedCount(raw)'] as number | undefined,
        filterVariant: 'range',
        Cell: NumericCell,
      },
      {
        id: 'geolocations',
        header: strings.LATITUDE_LONGITUDE,
        accessorFn: (row) => {
          const geolocations = (row.geolocations || []) as any[];
          return geolocations.map((gl) => gl.coordinates as string).join(', ');
        },
        filterVariant: 'text',
        Cell: GeolocationCell,
      },
      {
        id: 'plantId',
        header: strings.PLANT_ID,
        accessorKey: 'plantId',
        filterVariant: 'text',
      },
    ];
  }, [
    activeLocale,
    facilityNameToTz,
    uniqueStates,
    uniqueFacilityNames,
    uniqueSubLocationNames,
    uniqueSpeciesNames,
    uniqueProjectNames,
    AccessionNumberCell,
    ViabilityCell,
    NumericCell,
    GeolocationCell,
  ]);

  const downloadReportHandler = useCallback((table: MRT_TableInstance<SearchResponseElementWithId>) => {
    const filteredRows = table.getSortedRowModel().rows;
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => !col.id.startsWith('mrt-') && typeof col.columnDef.header === 'string');
    const csvColumns = visibleColumns.map((col) => ({
      key: col.id,
      displayLabel: col.columnDef.header as string,
    }));
    const csvData = filteredRows.map((row) => {
      const rowData: Record<string, string> = {};
      visibleColumns.forEach((col) => {
        const value = row.getValue(col.id);
        rowData[col.id] = value !== null && value !== undefined ? String(value) : '';
      });
      return rowData;
    });
    const blob = makeCsv(csvColumns, csvData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'accessions.csv');
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  if (searchResults === undefined) {
    return (
      <Card>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  } else if (searchResults === null) {
    return (
      <Card>
        <Box sx={{ padding: '32px', textAlign: 'center' }}>{strings.GENERIC_ERROR}</Box>
      </Card>
    );
  }

  return (
    <Card>
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={editableColumns}
        data={searchResults}
        enableEditing={false}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={true}
        storageKey={TABLE_STATE_STORAGE_KEY}
        tableOptions={{
          defaultColumn: {
            enableEditing: false,
            filterVariant: 'text',
            sortUndefined: 'last',
          },
          state: {
            sorting,
            columnOrder,
            columnVisibility,
            density,
            columnFilters,
            pagination,
            showColumnFilters,
            showGlobalFilter,
          },
          onSortingChange: setSorting,
          onPaginationChange,
          onColumnOrderChange: setColumnOrder,
          onColumnVisibilityChange: setColumnVisibility,
          onColumnFiltersChange: setColumnFilters,
          onShowColumnFiltersChange: setShowColumnFilters,
          onShowGlobalFilterChange: setShowGlobalFilter,
          onDensityChange,
          enableColumnPinning: true,
          enableColumnActions: true,
          enableHiding: true,
          enableColumnDragging: true,
          positionGlobalFilter: 'right',
          getRowId: (row) => String(row.id),
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
              <Tooltip title={strings.EXPORT}>
                <IconButton onClick={() => downloadReportHandler(table)}>
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
          muiTableBodyCellProps: ({ row, column, table }) => {
            const visualIndex = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
            return { id: `row${visualIndex + 1}-${column.id}` };
          },
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
        }}
        sx={{ padding: 0 }}
      />
    </Card>
  );
}
