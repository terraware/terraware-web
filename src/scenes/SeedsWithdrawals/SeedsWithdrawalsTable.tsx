import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { Dayjs } from 'dayjs';
import {
  MRT_Cell,
  MRT_ColumnOrderState,
  MRT_PaginationState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MRT_VisibilityState,
} from 'material-react-table';

import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS, VIABILITY_TEST_QUERY_PARAM } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers';
import { SearchSortOrderElement } from 'src/queries/generated/search';
import {
  SearchSeedWithdrawalPayload,
  SearchSeedWithdrawalsApiArgs,
  useLazyCountSeedWithdrawalsQuery,
  useLazySearchSeedWithdrawalsFilterOptionsQuery,
  useLazySearchSeedWithdrawalsQuery,
} from 'src/queries/search/seedWithdrawals';
import {
  exportSeedWithdrawals,
  seedWithdrawalEstimatedWeight,
  seedWithdrawalQuantity,
} from 'src/scenes/SeedsWithdrawals/exportSeedWithdrawals';
import { SeedWithdrawalPurpose } from 'src/types/Accession';
import { Project } from 'src/types/Project';
import { TABLES } from 'src/types/Tables';
import useDebounce from 'src/utils/useDebounce';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import { SeedWithdrawalPurposes, seedWithdrawalPurposeLabel } from 'src/utils/withdrawalPurposes';

const TABLE = TABLES.seedWithdrawals;

const ITEMS_PER_PAGE = 100;
const EXPORT_PAGE_SIZE = 1000;
const PROJECT_COLUMN_ID = 'projectName';
const NOTES_COLUMN_ID = 'notes';
const ESTIMATED_COUNT_COLUMN_ID = 'estimatedCount';
const ESTIMATED_WEIGHT_COLUMN_ID = 'estimatedWeightQuantity';

const DEFAULT_COLUMN_VISIBILITY: MRT_VisibilityState = {
  [ESTIMATED_COUNT_COLUMN_ID]: false,
  [ESTIMATED_WEIGHT_COLUMN_ID]: false,
  [PROJECT_COLUMN_ID]: false,
  [NOTES_COLUMN_ID]: false,
};

const DEFAULT_COLUMN_ORDER: MRT_ColumnOrderState = [
  'date',
  'accessionNumber',
  'speciesName',
  'purpose',
  'seedBankName',
  'quantity',
  'destination',
  'withdrawnByName',
  ESTIMATED_COUNT_COLUMN_ID,
  ESTIMATED_WEIGHT_COLUMN_ID,
  PROJECT_COLUMN_ID,
  NOTES_COLUMN_ID,
];

const DEFAULT_SORT_ORDER: SearchSortOrderElement[] = [{ field: 'date', direction: 'Descending' }];

/** The accession page, optionally opening straight onto one of its viability tests. */
const getAccessionLocation = (accessionId: number, viabilityTestId?: number): string => {
  const path = APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(accessionId));
  return viabilityTestId ? `${path}?${VIABILITY_TEST_QUERY_PARAM}=${viabilityTestId}` : path;
};

const getDateFilterValue = (dateFilterValue: unknown): { minDate?: string; maxDate?: string } | undefined => {
  if (!dateFilterValue || !Array.isArray(dateFilterValue)) {
    return undefined;
  }

  const minDate = dateFilterValue[0] ? (dateFilterValue[0] as Dayjs).format('YYYY-MM-DD') : undefined;
  const maxDate = dateFilterValue[1] ? (dateFilterValue[1] as Dayjs).format('YYYY-MM-DD') : undefined;

  return minDate || maxDate ? { minDate, maxDate } : undefined;
};

export default function SeedsWithdrawalsTable(): JSX.Element {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const { availableProjects: projects } = useProjects();
  const numberFormatter = useNumberFormatter();

  const [searchFilterOptions, searchFilterOptionsResponse] = useLazySearchSeedWithdrawalsFilterOptionsQuery();
  const [searchSeedWithdrawals, searchSeedWithdrawalsResponse] = useLazySearchSeedWithdrawalsQuery();
  // Export needs its own trigger: reusing the one above would re-point the displayed page's
  // subscription at the full unpaginated result set.
  const [searchSeedWithdrawalsForExport] = useLazySearchSeedWithdrawalsQuery();
  const [countSeedWithdrawals, countSeedWithdrawalsResponse] = useLazyCountSeedWithdrawalsQuery();

  const rows = useMemo(() => searchSeedWithdrawalsResponse?.data?.results ?? [], [searchSeedWithdrawalsResponse]);
  const totalRowCount = useMemo(() => countSeedWithdrawalsResponse.currentData ?? 0, [countSeedWithdrawalsResponse]);

  useEffect(() => {
    if (selectedOrganization) {
      void searchFilterOptions(selectedOrganization.id);
    }
  }, [searchFilterOptions, selectedOrganization]);

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

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
  } = useTableState(TABLE, {
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultColumnVisibility: DEFAULT_COLUMN_VISIBILITY,
    persistedMultiSelectColumnIds: ['destination', PROJECT_COLUMN_ID, 'purpose', 'speciesName'],
    persistFilters: true,
  });

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: ITEMS_PER_PAGE,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([{ id: 'date', desc: true }]);

  const { speciesOptions, seedBankOptions, destinationOptions } = useMemo(
    () => ({
      speciesOptions: searchFilterOptionsResponse.currentData?.speciesNames ?? [],
      seedBankOptions: searchFilterOptionsResponse.currentData?.seedBankNames ?? [],
      destinationOptions: searchFilterOptionsResponse.currentData?.destinations ?? [],
    }),
    [
      searchFilterOptionsResponse.currentData?.destinations,
      searchFilterOptionsResponse.currentData?.seedBankNames,
      searchFilterOptionsResponse.currentData?.speciesNames,
    ]
  );

  const uniqueProjectNames = useMemo(() => {
    const projectNames = (projects ?? []).map((project: Project) => project.name).filter((name) => !!name);
    return Array.from(new Set(projectNames)).sort();
  }, [projects]);

  // Rebuilt whenever the localized strings change, so a purpose picked after a language switch
  // still maps back to the value the API expects rather than its translated label.
  const purposeLabelToValue = useMemo(() => {
    const map: Record<string, SeedWithdrawalPurpose> = {};
    SeedWithdrawalPurposes.forEach((purpose) => {
      map[seedWithdrawalPurposeLabel(purpose, strings)] = purpose;
    });
    return map;
  }, [strings]);

  const accessionLinkStyles = useMemo(
    () => ({ fontSize: '16px', color: theme.palette.TwClrTxtBrand, textDecoration: 'none' }),
    [theme]
  );

  const DateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as string;
      return (
        <Link to={getAccessionLocation(row.accessionId)} style={accessionLinkStyles}>
          {value}
        </Link>
      );
    },
    [accessionLinkStyles]
  );

  const AccessionNumberCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as string;
      return (
        <Link to={getAccessionLocation(row.accessionId)} style={accessionLinkStyles}>
          {value}
        </Link>
      );
    },
    [accessionLinkStyles]
  );

  const PurposeCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => {
      const row = cell.row.original;
      const label = seedWithdrawalPurposeLabel(cell.getValue() as SeedWithdrawalPurpose | undefined, strings);

      if (row.purpose === 'Viability Testing' && row.viabilityTestId) {
        return (
          <Link to={getAccessionLocation(row.accessionId, row.viabilityTestId)} style={accessionLinkStyles}>
            {label}
          </Link>
        );
      }

      if (row.purpose === 'Nursery' && row.destination) {
        const withNursery = strings.formatString(strings.PURPOSE_WITH_DESTINATION, label, row.destination);
        // A nursery withdrawal creates the batch its seeds were transferred into.
        return row.batchId ? (
          <Link to={APP_PATHS.INVENTORY_BATCH.replace(':batchId', String(row.batchId))} style={accessionLinkStyles}>
            {withNursery}
          </Link>
        ) : (
          <span>{withNursery}</span>
        );
      }

      return <span>{label}</span>;
    },
    [accessionLinkStyles, strings]
  );

  const EstimatedCountCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => {
      const value = cell.getValue() as number | undefined;
      return <span>{value !== undefined ? numberFormatter.format(value) : ''}</span>;
    },
    [numberFormatter]
  );

  const EstimatedWeightCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => (
      <span>{seedWithdrawalEstimatedWeight(cell.row.original)}</span>
    ),
    []
  );

  const QuantityCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => (
      <span>{seedWithdrawalQuantity(cell.row.original)}</span>
    ),
    []
  );

  const columns = useMemo<EditableTableColumn<SearchSeedWithdrawalPayload>[]>(
    () => [
      {
        id: 'date',
        header: strings.DATE,
        accessorKey: 'date',
        enableEditing: false,
        filterVariant: 'date-range',
        Cell: DateCell,
      },
      {
        id: 'accessionNumber',
        header: strings.ACCESSION,
        accessorKey: 'accessionNumber',
        enableEditing: false,
        filterVariant: 'text',
        filterFn: () => true,
        Cell: AccessionNumberCell,
      },
      {
        id: 'speciesName',
        header: strings.SPECIES,
        accessorKey: 'speciesName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: speciesOptions,
        filterFn: () => true,
      },
      {
        id: 'purpose',
        header: strings.PURPOSE,
        accessorKey: 'purpose',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: SeedWithdrawalPurposes.map((purpose) => seedWithdrawalPurposeLabel(purpose, strings)),
        filterFn: () => true,
        Cell: PurposeCell,
      },
      {
        id: 'seedBankName',
        header: strings.FROM_SEED_BANK,
        accessorKey: 'seedBankName',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: seedBankOptions,
        filterFn: () => true,
      },
      {
        id: 'quantity',
        header: strings.QUANTITY,
        accessorKey: 'quantity',
        enableEditing: false,
        // No filterVariant, so EditableTable leaves this column unfiltered: rows record
        // quantities in different units, and a numeric range would compare seed counts against
        // weights. Sorting is still useful within a single unit.
        Cell: QuantityCell,
      },
      {
        id: 'destination',
        header: strings.DESTINATION,
        accessorKey: 'destination',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: destinationOptions,
        filterFn: () => true,
      },
      {
        id: 'withdrawnByName',
        header: strings.WITHDRAWN_BY,
        accessorKey: 'withdrawnByName',
        enableEditing: false,
        filterVariant: 'text',
        filterFn: () => true,
      },
      {
        id: ESTIMATED_COUNT_COLUMN_ID,
        header: strings.ESTIMATED_SEED_COUNT,
        accessorKey: 'estimatedCount',
        enableEditing: false,
        Cell: EstimatedCountCell,
      },
      {
        id: ESTIMATED_WEIGHT_COLUMN_ID,
        header: strings.ESTIMATED_WEIGHT,
        accessorKey: 'estimatedWeightQuantity',
        enableEditing: false,
        Cell: EstimatedWeightCell,
      },
      {
        id: PROJECT_COLUMN_ID,
        header: strings.PROJECT,
        accessorKey: 'projectName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
        filterFn: () => true,
      },
      {
        id: NOTES_COLUMN_ID,
        header: strings.NOTES,
        accessorKey: 'notes',
        enableEditing: false,
        filterVariant: 'text',
        filterFn: () => true,
      },
    ],
    [
      strings,
      DateCell,
      AccessionNumberCell,
      speciesOptions,
      PurposeCell,
      seedBankOptions,
      QuantityCell,
      destinationOptions,
      EstimatedCountCell,
      EstimatedWeightCell,
      uniqueProjectNames,
    ]
  );

  const searchArgs: SearchSeedWithdrawalsApiArgs = useMemo(() => {
    const filterValue = (columnId: string) => columnFilters.find((column) => column.id === columnId)?.value;

    const purposeFilterValue = filterValue('purpose');
    const purposes =
      purposeFilterValue && Array.isArray(purposeFilterValue)
        ? purposeFilterValue.map((value) => (typeof value === 'string' ? (purposeLabelToValue[value] ?? value) : value))
        : undefined;

    const sortOrder =
      sorting.length > 0
        ? sorting.map((sortingOption): SearchSortOrderElement => ({
            field: sortingOption.id,
            direction: sortingOption.desc ? 'Descending' : 'Ascending',
          }))
        : DEFAULT_SORT_ORDER;

    return {
      organizationId: selectedOrganization?.id,
      searchTerm: debouncedSearchTerm,
      accessionNumber: filterValue('accessionNumber') as string | undefined,
      date: getDateFilterValue(filterValue('date')),
      purposes: purposes as SeedWithdrawalPurpose[] | undefined,
      speciesNames: filterValue('speciesName') as string[] | undefined,
      seedBankName: filterValue('seedBankName') as string | undefined,
      destinations: filterValue('destination') as string[] | undefined,
      projectNames: filterValue(PROJECT_COLUMN_ID) as string[] | undefined,
      notes: filterValue(NOTES_COLUMN_ID) as string | undefined,
      withdrawnByName: filterValue('withdrawnByName') as string | undefined,
      sortOrder,
    };
  }, [columnFilters, debouncedSearchTerm, purposeLabelToValue, selectedOrganization?.id, sorting]);

  useEffect(() => {
    if (searchArgs.organizationId) {
      void countSeedWithdrawals(searchArgs, true);
    }
  }, [countSeedWithdrawals, searchArgs]);

  useEffect(() => {
    if (searchArgs.organizationId) {
      void searchSeedWithdrawals(
        {
          ...searchArgs,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        },
        true
      );
    }
  }, [pagination.pageIndex, pagination.pageSize, searchArgs, searchSeedWithdrawals]);

  // Anything that narrows the results has to send the user back to the first page, or the next
  // query runs with an offset past the end of a now-shorter result set and the table renders an
  // empty page under a non-zero total.
  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [columnFilters, debouncedSearchTerm]);

  const onExport = useCallback(async () => {
    if (!selectedOrganization) {
      return;
    }

    const isFiltered = !!(
      debouncedSearchTerm !== '' ||
      searchArgs.accessionNumber ||
      searchArgs.date?.minDate ||
      searchArgs.date?.maxDate ||
      searchArgs.destinations?.length ||
      searchArgs.notes ||
      searchArgs.projectNames?.length ||
      searchArgs.purposes?.length ||
      searchArgs.seedBankName ||
      searchArgs.speciesNames?.length ||
      searchArgs.withdrawnByName
    );

    // The search service may cap how many rows one request returns, so follow the cursor it hands
    // back until it stops coming rather than trusting a single request to hold the whole log.
    const allRows: SearchSeedWithdrawalPayload[] = [];
    let cursor: string | undefined;

    for (;;) {
      const page = await searchSeedWithdrawalsForExport({
        ...searchArgs,
        limit: EXPORT_PAGE_SIZE,
        cursor,
      }).unwrap();

      allRows.push(...page.results);

      if (!page.cursor || page.results.length === 0) {
        break;
      }
      cursor = page.cursor;
    }

    void exportSeedWithdrawals({ isFiltered, seedWithdrawals: allRows });
  }, [debouncedSearchTerm, searchArgs, searchSeedWithdrawalsForExport, selectedOrganization]);

  return (
    <EditableTable
      key='seeds-withdrawals-table'
      clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
      columns={columns}
      data={rows}
      enableEditing={false}
      enableSorting={true}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableColumnOrdering={true}
      storageKey={TABLE.storageKey}
      enablePagination={true}
      enableTopToolbar={true}
      enableBottomToolbar={true}
      initialSorting={sorting}
      tableOptions={{
        state: {
          pagination,
          sorting,
          columnFilters,
          columnVisibility,
          showColumnFilters,
          showGlobalFilter,
          globalFilter: searchValue,
          density,
          columnOrder,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onShowColumnFiltersChange: setShowColumnFilters,
        onShowGlobalFilterChange: setShowGlobalFilter,
        onGlobalFilterChange: setSearchValue,
        onColumnOrderChange: setColumnOrder,
        onDensityChange,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: totalRowCount,
        enableColumnPinning: true,
        enableColumnActions: true,
        enableHiding: true,
        enableGrouping: false,
        enableColumnDragging: true,
        positionGlobalFilter: 'right',
        renderToolbarInternalActions: ({ table }) => (
          <Box display='flex' gap={0.5}>
            <Tooltip title={strings.EXPORT}>
              <IconButton onClick={() => void onExport()}>
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
        muiTableBodyCellProps: ({ row, column }) => ({ id: `row${row.index + 1}-${column.id}` }),
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
  );
}
