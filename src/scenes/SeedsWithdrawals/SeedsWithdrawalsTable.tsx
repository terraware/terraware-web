import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn } from '@terraware/web-components';
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

import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
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
import { SeedWithdrawalPurpose } from 'src/types/Accession';
import { Project } from 'src/types/Project';
import { unitAbbv } from 'src/units';
import useDebounce from 'src/utils/useDebounce';
import { SeedWithdrawalPurposes, seedWithdrawalPurposeLabel } from 'src/utils/withdrawalPurposes';

const TABLE_STATE_STORAGE_KEY = 'seeds-withdrawals-table';

const ITEMS_PER_PAGE = 100;
const PROJECT_COLUMN_ID = 'projectName';
const NOTES_COLUMN_ID = 'notes';

const DEFAULT_COLUMN_VISIBILITY: MRT_VisibilityState = {
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
  PROJECT_COLUMN_ID,
  NOTES_COLUMN_ID,
];

const DEFAULT_SORT_ORDER: SearchSortOrderElement[] = [{ field: 'date', direction: 'Descending' }];

const seedWithdrawalQuantity = (withdrawal: SearchSeedWithdrawalPayload): string => {
  if (withdrawal.quantity === undefined) {
    return '';
  }
  const abbreviation = withdrawal.units ? unitAbbv()[withdrawal.units] : undefined;
  return abbreviation ? `${withdrawal.quantity} ${abbreviation}` : `${withdrawal.quantity}`;
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

  const [searchFilterOptions, searchFilterOptionsResponse] = useLazySearchSeedWithdrawalsFilterOptionsQuery();
  const [searchSeedWithdrawals, searchSeedWithdrawalsResponse] = useLazySearchSeedWithdrawalsQuery();
  const [countSeedWithdrawals, countSeedWithdrawalsResponse] = useLazyCountSeedWithdrawalsQuery();

  const rows = useMemo(() => searchSeedWithdrawalsResponse?.data ?? [], [searchSeedWithdrawalsResponse]);
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
  } = useTableState(TABLE_STATE_STORAGE_KEY, {
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

  const purposeLabelToValue = useMemo(() => {
    const map: Record<string, SeedWithdrawalPurpose> = {};
    SeedWithdrawalPurposes.forEach((purpose) => {
      map[seedWithdrawalPurposeLabel(purpose, strings)] = purpose;
    });
    return map;
  }, []);

  const accessionLinkStyles = useMemo(
    () => ({ fontSize: '16px', color: theme.palette.TwClrTxtBrand, textDecoration: 'none' }),
    [theme]
  );

  const DateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchSeedWithdrawalPayload> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as string;
      return (
        <Link
          to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(row.accessionId))}
          style={accessionLinkStyles}
        >
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
        <Link
          to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(row.accessionId))}
          style={accessionLinkStyles}
        >
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

      return (
        <span>
          {row.purpose === 'Nursery' && row.destination
            ? strings.formatString(strings.PURPOSE_WITH_DESTINATION, label, row.destination)
            : label}
        </span>
      );
    },
    [strings]
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

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

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
      storageKey={TABLE_STATE_STORAGE_KEY}
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
