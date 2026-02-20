import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ColumnFiltersState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import {
  selectNurseryWithdrawalsCount,
  selectNurseryWithdrawalsFilterOptions,
  selectNurseryWithdrawalsList,
} from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsSelectors';
import {
  requestCountNurseryWithdrawals,
  requestListNurseryWithdrawals,
  requestNurseryWithdrawalsFilterOptions,
} from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import UndoWithdrawalModal from 'src/scenes/NurseryRouter/UndoWithdrawalModal';
import WithdrawalHistoryMenu from 'src/scenes/NurseryRouter/WithdrawalHistoryMenu';
import { exportNurseryWithdrawalResults } from 'src/scenes/NurseryRouter/exportNurseryData';
import { NurseryWithdrawalPurpose, NurseryWithdrawalPurposes, purposeLabel } from 'src/types/Batch';
import { Project } from 'src/types/Project';
import {
  AndNodePayload,
  FieldNodePayload,
  NotNodePayload,
  OrNodePayload,
  SearchNodePayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const ITEMS_PER_PAGE = 100;

const DEFAULT_SORT_ORDER: SearchSortOrder = {
  field: 'withdrawnDate',
  direction: 'Descending',
};

// Menu cell component that can use hooks
const MenuCellComponent = ({ row, reloadData }: { row: SearchResponseElement; reloadData: () => void }) => {
  const [undoModalOpened, setUndoModalOpened] = useState(false);
  const { NURSERY_TRANSFER } = NurseryWithdrawalPurposes;

  if (row.purpose !== NURSERY_TRANSFER && !row.undoesWithdrawalId && !row.undoneByWithdrawalId) {
    return (
      <>
        {undoModalOpened && (
          <UndoWithdrawalModal onClose={() => setUndoModalOpened(false)} row={row} reload={reloadData} />
        )}
        <WithdrawalHistoryMenu
          reassign={() => {
            /* onWithdrawalClicked callback removed */
          }}
          withdrawal={row}
          undo={() => setUndoModalOpened(true)}
        />
      </>
    );
  }
  return null;
};

export default function NurseryWithdrawalsTable(): JSX.Element {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();
  const substratumParam = query.get('substratumName');
  const siteParam = query.get('siteName');
  const dispatch = useAppDispatch();

  const projects = useAppSelector(selectProjects);

  const [listRequestId, setListRequestId] = useState<string>('');
  const withdrawalsListResult = useAppSelector(selectNurseryWithdrawalsList(listRequestId));
  const [countRequestId, setCountRequestId] = useState<string>('');
  const countResult = useAppSelector(selectNurseryWithdrawalsCount(countRequestId));
  const [filterOptionsRequestId, setFilterOptionsRequestId] = useState<string>('');
  const filterOptionsResult = useAppSelector(selectNurseryWithdrawalsFilterOptions(filterOptionsRequestId));

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [rows, setRows] = useState<SearchResponseElement[] | null>();
  const [searchValue] = useState('');
  const [totalRowCount, setTotalRowCount] = useState<number>();
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>(DEFAULT_SORT_ORDER);

  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [density, setDensity] = useState<MRT_DensityState>(() => {
    try {
      return (localStorage.getItem('nursery-withdrawals-table-density') as MRT_DensityState) || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  // Material React Table state
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: ITEMS_PER_PAGE,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'withdrawnDate',
      desc: true,
    },
  ]);
  // Load initial column filters from localStorage
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(() => {
    try {
      const stored = localStorage.getItem('nursery-withdrawals-table-columnFilters');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save column filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nursery-withdrawals-table-columnFilters', JSON.stringify(columnFilters));
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [columnFilters]);

  const handleColumnFiltersChange = useCallback((updater: any) => {
    setColumnFilters(updater);
  }, []);

  const numberFormatter = useNumberFormatter();
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reloadData = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const [nurseryNames, setNurseryNames] = useState<string[]>([]);
  const [destinationNames, setDestinationNames] = useState<string[]>([]);
  const [substratumOptions, setSubstratumOptions] = useState<string[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(requestNurseryWithdrawalsFilterOptions({ organizationId: selectedOrganization.id }));
      setFilterOptionsRequestId(request.requestId);
    }
  }, [dispatch, selectedOrganization]);

  useEffect(() => {
    if (filterOptionsResult?.status === 'success' && filterOptionsResult.data) {
      const toStrings = (key: string) =>
        (filterOptionsResult.data![key]?.values ?? [])
          .filter((v): v is string => typeof v === 'string' && v !== '')
          .sort();
      setNurseryNames(toStrings('facility_name'));
      setDestinationNames(toStrings('destinationName'));
      setSubstratumOptions(toStrings('substratumNames'));
      setSpeciesOptions(toStrings('batchWithdrawals.batch_species_scientificName'));
    }
  }, [filterOptionsResult]);

  // Get all project names for filter (from all available projects, not just current results)
  const uniqueProjectNames = useMemo(() => {
    if (!projects) {
      return [];
    }
    const projectNames = projects
      .map((project: Project) => project.name)
      .filter((name) => name !== null && name !== undefined && name !== '');
    return Array.from(new Set(projectNames)).sort();
  }, [projects]);

  // Get all withdrawal purposes for filter
  const purposeOptions = useMemo(() => {
    return Object.values(NurseryWithdrawalPurposes).map((purpose) => purposeLabel(purpose));
  }, []);

  // Create reverse mapping from label to value for filtering
  const purposeLabelToValue = useMemo(() => {
    const map: Record<string, NurseryWithdrawalPurpose> = {};
    Object.values(NurseryWithdrawalPurposes).forEach((purpose) => {
      map[purposeLabel(purpose)] = purpose;
    });
    return map;
  }, []);

  // Cell renderer components
  const WithdrawnDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as string;
      const linkStyles = {
        fontSize: '16px',
        color: theme.palette.TwClrTxtBrand,
        textDecoration: 'none',
        ...(row.undoneByWithdrawalId ? { textDecoration: 'line-through' } : {}),
      };
      const withdrawalDetailLocation = APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', String(row.id));
      return (
        <Link to={withdrawalDetailLocation} style={linkStyles}>
          {value}
        </Link>
      );
    },
    [theme]
  );

  const PurposeCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as NurseryWithdrawalPurpose;
      const linkStyles = {
        fontSize: '16px',
        color: theme.palette.TwClrTxtBrand,
        textDecoration: 'none',
      };

      if (!row.undoesWithdrawalId) {
        return <span>{purposeLabel(value)}</span>;
      } else {
        const undoWithdrawalDetailLocation = APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(
          ':withdrawalId',
          String(row.undoesWithdrawalId)
        );
        return (
          <span style={{ display: 'block', margin: 0 }}>
            {`${strings.UNDO} `}
            <Link to={undoWithdrawalDetailLocation} style={linkStyles}>
              {String(row.undoesWithdrawalDate)}
            </Link>
          </span>
        );
      }
    },
    [theme, strings]
  );

  const SpeciesScientificNamesCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.getValue() as string[] | undefined;
      return value ? <TextTruncated stringList={value} moreText={strings.TRUNCATED_TEXT_MORE_LINK} /> : null;
    },
    [strings]
  );

  const SubstratumNamesCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.getValue();
      return value ? (
        <TextTruncated stringList={[value as string]} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />
      ) : null;
    },
    [strings]
  );

  const TotalWithdrawnCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.getValue() as number | undefined;
      return value !== undefined ? <span>{numberFormatter.format(value || 0)}</span> : null;
    },
    [numberFormatter]
  );

  const MenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const row = cell.row.original;
      return <MenuCellComponent row={row} reloadData={reloadData} />;
    },
    [reloadData]
  );

  const columns = useMemo<EditableTableColumn<SearchResponseElement>[]>(
    () => [
      {
        id: 'withdrawnDate',
        header: strings.DATE,
        accessorKey: 'withdrawnDate',
        enableEditing: false,
        filterVariant: 'date-range',
        sortUndefined: 'last',
        Cell: WithdrawnDateCell,
      },
      {
        id: 'purpose',
        header: strings.PURPOSE,
        accessorKey: 'purpose',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: purposeOptions,
        enableColumnFilterModes: false,
        sortUndefined: 'last',
        filterFn: () => true,
        Cell: PurposeCell,
      },
      {
        id: 'facility_name',
        header: strings.FROM_NURSERY,
        accessorKey: 'facility_name',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: nurseryNames,
        enableColumnFilterModes: false,
        sortUndefined: 'last',
        filterFn: () => true,
      },
      {
        id: 'destinationName',
        header: strings.PLANTING_SITE,
        accessorKey: 'destinationName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: destinationNames,
        enableColumnFilterModes: false,
        sortUndefined: 'last',
        filterFn: () => true,
      },
      {
        id: 'project_names',
        header: strings.PROJECTS,
        accessorKey: 'project_names',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
        enableColumnFilterModes: false,
        sortUndefined: 'last',
        filterFn: () => true, // Disable client-side filtering, handled by backend
        Cell: ({ cell }) => {
          const value = cell.getValue() as string[] | undefined;
          return value ? <span>{value.filter((name) => !!name).join(', ')}</span> : null;
        },
      },
      {
        id: 'substratumNames',
        header: strings.TO_SUBSTRATUM,
        accessorKey: 'substratumNames',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: substratumOptions,
        enableColumnFilterModes: false,
        sortUndefined: 'last',
        filterFn: () => true,
        Cell: SubstratumNamesCell,
      },
      {
        id: 'speciesScientificNames',
        header: strings.SPECIES,
        accessorKey: 'speciesScientificNames',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: speciesOptions,
        enableColumnFilterModes: false,
        sortUndefined: 'last',
        filterFn: () => true,
        Cell: SpeciesScientificNamesCell,
      },
      {
        id: 'totalWithdrawn(raw)',
        header: strings.TOTAL_QUANTITY,
        accessorKey: 'totalWithdrawn(raw)',
        enableEditing: false,
        filterVariant: 'range',
        sortUndefined: 'last',
        Cell: TotalWithdrawnCell,
      },
      {
        id: 'menu',
        header: '',
        accessorKey: 'menu',
        enableEditing: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,
        enableColumnDragging: false,
        enableHiding: false,
        Cell: MenuCell,
      },
    ],
    [
      strings,
      nurseryNames,
      destinationNames,
      substratumOptions,
      speciesOptions,
      uniqueProjectNames,
      purposeOptions,
      WithdrawnDateCell,
      PurposeCell,
      SubstratumNamesCell,
      SpeciesScientificNamesCell,
      TotalWithdrawnCell,
      MenuCell,
    ]
  );

  // Convert MRT column filters to backend search format
  const columnFilterNodes: SearchNodePayload[] = useMemo(() => {
    return columnFilters.map((filter) => {
      const fieldName =
        filter.id === 'project_names'
          ? 'batchWithdrawals.batch_project_name'
          : filter.id === 'speciesScientificNames'
            ? 'batchWithdrawals.batch_species_scientificName'
            : filter.id;
      let filterValue = filter.value;

      // For purpose filter, convert label back to value
      if (filter.id === 'purpose' && typeof filterValue === 'string') {
        filterValue = purposeLabelToValue[filterValue] || filterValue;
      }

      // Find the column definition to check filter type
      const column = columns.find((col) => col.id === filter.id);
      const isSelectFilter = column?.filterVariant === 'select';
      const isMultiSelectFilter = column?.filterVariant === 'multi-select';

      // Handle different filter types
      if (Array.isArray(filterValue)) {
        // Multi-select filter: OR across selected values
        if (isMultiSelectFilter && filterValue.length > 0) {
          const selected = filterValue.filter((v) => v !== undefined && v !== '');
          if (selected.length === 1) {
            return { operation: 'field', field: fieldName, type: 'Exact', values: [selected[0]] };
          }
          return {
            operation: 'or',
            children: selected.map((v) => ({
              operation: 'field',
              field: fieldName,
              type: 'Exact',
              values: [v],
            })),
          } as OrNodePayload;
        }
        // Range filter (e.g., numbers)
        if (filterValue.length === 2) {
          const children: SearchNodePayload[] = [];
          if (filterValue[0] !== undefined && filterValue[0] !== '') {
            children.push({
              operation: 'field',
              field: fieldName,
              type: 'Range',
              values: [String(filterValue[0]), '999999999'],
            });
          }
          if (filterValue[1] !== undefined && filterValue[1] !== '') {
            children.push({
              operation: 'field',
              field: fieldName,
              type: 'Range',
              values: ['0', String(filterValue[1])],
            });
          }
          return children.length > 1
            ? { operation: 'and', children }
            : children[0] || { operation: 'field', field: fieldName, type: 'Exact', values: [] };
        }
      } else if (typeof filterValue === 'string') {
        // Text or select filter
        return {
          operation: 'field',
          field: fieldName,
          type: isSelectFilter ? 'Exact' : 'Fuzzy',
          values: [filterValue],
        };
      }

      return {
        operation: 'field',
        field: fieldName,
        type: 'Exact',
        values: [String(filterValue)],
      };
    });
  }, [columnFilters, columns, purposeLabelToValue]);

  const searchChildren: SearchNodePayload[] = useMemo(() => {
    const { type, values } = parseSearchTerm(debouncedSearchTerm);
    const finalSearchValueChildren: SearchNodePayload[] = [];
    const searchValueChildren: SearchNodePayload[] = [];
    if (debouncedSearchTerm) {
      const fromNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'facility_name',
        type,
        values,
      };
      searchValueChildren.push(fromNurseryNode);

      const destinationNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'destinationName',
        type,
        values,
      };
      searchValueChildren.push(destinationNurseryNode);

      const speciesNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'batchWithdrawals.batch_species_scientificName',
        type,
        values,
      };
      searchValueChildren.push(speciesNameNode);
    }

    const filterValueChildren: SearchNodePayload[] = [...Object.values(filters), ...columnFilterNodes];

    if (searchValueChildren.length) {
      const searchValueNodes: OrNodePayload = {
        operation: 'or',
        children: searchValueChildren,
      };

      if (filterValueChildren.length) {
        const filterValueNodes: AndNodePayload = {
          operation: 'and',
          children: filterValueChildren,
        };

        finalSearchValueChildren.push({
          operation: 'and',
          children: [filterValueNodes, searchValueNodes],
        });
      } else {
        finalSearchValueChildren.push(searchValueNodes);
      }
    } else if (filterValueChildren.length) {
      const filterValueNodes: AndNodePayload = {
        operation: 'and',
        children: filterValueChildren,
      };
      finalSearchValueChildren.push(filterValueNodes);
    }

    // If the batch was deleted before we added the server-side logic to deal with deleting batches
    // that have withdrawals, there won't be any batchWithdrawals values. In that case, we can't
    // show the species name or the total withdrawn. Filter withdrawals without batches out since
    // they're useless to show.
    const batchExistsNode: NotNodePayload = {
      operation: 'not',
      child: {
        operation: 'field',
        field: 'batchWithdrawals.batch_id',
        type: 'Exact',
        values: [null],
      },
    };
    finalSearchValueChildren.push(batchExistsNode);

    return finalSearchValueChildren;
  }, [filters, debouncedSearchTerm, columnFilterNodes]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  useEffect(() => {
    if (countResult?.status === 'success' && countResult?.data) {
      if (countResult?.data) {
        setTotalRowCount(countResult.data);
      }
    }
  }, [countResult]);

  useEffect(() => {
    if (withdrawalsListResult?.status === 'success' && withdrawalsListResult?.data) {
      if (withdrawalsListResult?.data) {
        setRows(withdrawalsListResult.data);
      }
    }
  }, [withdrawalsListResult]);

  useEffect(() => {
    if (siteParam) {
      query.delete('siteName');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      setFilters((curr) => ({
        ...curr,
        destinationName: {
          field: 'destinationName',
          operation: 'field',
          type: 'Exact',
          values: [siteParam],
        },
      }));
    }
  }, [siteParam, query, location, navigate]);

  useEffect(() => {
    if (substratumParam) {
      query.delete('substratumName');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      setFilters((curr) => ({
        ...curr,
        substratumNames: {
          field: 'substratumNames',
          operation: 'field',
          type: 'Exact',
          values: [substratumParam],
        },
      }));
    }
  }, [substratumParam, query, location, navigate]);

  // Sync sorting state with search sort order
  useEffect(() => {
    if (sorting.length > 0) {
      const sortField = sorting[0];
      const orderByStr =
        sortField.id === 'speciesScientificNames'
          ? 'batchWithdrawals.batch_species_scientificName'
          : sortField.id === 'project_names'
            ? 'batchWithdrawals.batch_project_name'
            : sortField.id;
      setSearchSortOrder({
        field: orderByStr,
        direction: sortField.desc ? 'Descending' : 'Ascending',
      });
    }
  }, [sorting]);

  const onExport = useCallback(() => {
    if (selectedOrganization && rows) {
      void exportNurseryWithdrawalResults({ nurseryWithdrawalResults: rows });
    }
  }, [rows, selectedOrganization]);

  // Request count for pagination
  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(
        requestCountNurseryWithdrawals({ organizationId: selectedOrganization.id, searchCriteria: searchChildren })
      );
      setCountRequestId(request.requestId);
    }
  }, [dispatch, searchChildren, selectedOrganization]);

  // Fetch data when pagination or sort changes
  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(
        requestListNurseryWithdrawals({
          organizationId: selectedOrganization.id,
          searchCriteria: searchChildren,
          sortOrder: searchSortOrder,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        })
      );
      setListRequestId(request.requestId);
    }
  }, [dispatch, searchChildren, searchSortOrder, selectedOrganization, pagination, reloadTrigger]);

  return (
    <EditableTable
      key='nursery-withdrawals-table'
      columns={columns}
      data={rows || []}
      enableEditing={false}
      enableSorting={true}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableColumnOrdering={true}
      storageKey='nursery-withdrawals-table'
      enablePagination={true}
      enableTopToolbar={true}
      enableBottomToolbar={true}
      initialSorting={sorting}
      tableOptions={{
        state: {
          pagination,
          sorting,
          columnFilters,
          showColumnFilters,
          showGlobalFilter,
          density,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: handleColumnFiltersChange,
        onShowColumnFiltersChange: setShowColumnFilters,
        onShowGlobalFilterChange: setShowGlobalFilter,
        onDensityChange: (updater) => {
          setDensity((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            try {
              localStorage.setItem('nursery-withdrawals-table-density', next);
            } catch {
              // ignore
            }
            return next;
          });
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: totalRowCount || 0,
        enableColumnPinning: true,
        enableColumnActions: true,
        enableHiding: true,
        enableGrouping: false,
        enableColumnDragging: true,
        positionGlobalFilter: 'right',
        renderToolbarInternalActions: ({ table }) => (
          <Box display='flex' gap={0.5}>
            <Tooltip title={strings.EXPORT}>
              <IconButton onClick={onExport}>
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
        muiTableHeadCellProps: ({ column }) =>
          column.id === 'menu' ? { sx: { '& .Mui-TableHeadCell-Content': { display: 'none' } } } : {},
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
