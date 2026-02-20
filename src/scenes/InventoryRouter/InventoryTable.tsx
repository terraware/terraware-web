import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Popover, Tooltip, useTheme } from '@mui/material';
import { Button, EditableTable, EditableTableColumn, TableColumnType } from '@terraware/web-components';
import _, { isArray } from 'lodash';
import {
  MRT_Cell,
  MRT_ColumnOrderState,
  MRT_DensityState,
  MRT_RowSelectionState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import ProjectAssignTopBarButton from 'src/components/ProjectAssignTopBarButton';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { convertFilterGroupToMap } from 'src/scenes/InventoryRouter/FilterUtils';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import Search from 'src/scenes/InventoryRouter/Search';
import { NurseryBatchService } from 'src/services';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import ChangeQuantityModal from './view/ChangeQuantityModal';
import DeleteBatchesModal from './view/DeleteBatchesModal';
import QuantitiesMenu from './view/QuantitiesMenu';

interface InventoryTableProps {
  allowSelectionProjectAssign?: boolean;
  columns: TableColumnType[] | (() => TableColumnType[]);
  filters: InventoryFiltersUnion;
  isPresorted: boolean;
  origin: OriginPage;
  reloadData?: () => void;
  results: SearchResponseElement[];
  setFilters: (f: InventoryFiltersUnion) => void;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  temporalSearchValue: string;
  emptyTableMessage?: string;
}

export default function InventoryTable(props: InventoryTableProps): JSX.Element {
  const {
    results,
    setTemporalSearchValue,
    temporalSearchValue,
    filters,
    setFilters,
    setSearchSortOrder,
    isPresorted,
    columns,
    reloadData,
    origin,
    allowSelectionProjectAssign,
    emptyTableMessage,
  } = props;

  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const query = useQuery();

  const theme = useTheme();
  const { sessionFilters, setSessionFilters } = useSessionFilters(origin.toLowerCase());
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [pillListPortalEl, setPillListPortalEl] = useState<HTMLElement | null>(null);
  const [withdrawTooltip, setWithdrawTooltip] = useState<string>();
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [modalValues, setModalValues] = useState<{ type: string; openChangeQuantityModal: boolean; batch?: any }>({
    type: 'germinating',
    openChangeQuantityModal: false,
  });

  // Filter-related state
  const initialFilters: Record<string, SearchNodePayload> = useMemo(() => {
    const baseFilters: Record<string, SearchNodePayload> = {};
    if (origin === 'Batches') {
      baseFilters.showEmptyBatches = {
        field: 'showEmptyBatches',
        values: ['false'],
        type: 'Exact',
        operation: 'field',
      };
    } else if (origin === 'Species') {
      baseFilters.showEmptySpecies = {
        field: 'showEmptySpecies',
        values: ['false'],
        type: 'Exact',
        operation: 'field',
      };
    } else if (origin === 'Nursery') {
      baseFilters.showEmptyNurseries = {
        field: 'showEmptyNurseries',
        values: ['false'],
        type: 'Exact',
        operation: 'field',
      };
    }
    return baseFilters;
  }, [origin]);

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      setFilterAnchorEl(event.currentTarget);
    }
  };
  const handleFilterClose = () => setFilterAnchorEl(null);
  const [filterGroupFilters, setFilterGroupFilters] = useForm<Record<string, SearchNodePayload>>(initialFilters);

  const selectedRows = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => results[Number(index)])
        .filter(Boolean),
    [rowSelection, results]
  );

  // Sync query filters into view
  useEffect(() => {
    if (!sessionFilters) {
      // Wait for session filters to finish loading
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { showEmptyBatches: filterShowEmptyBatches, ...restFilters } = filters;
    const { showEmptyBatches: sessionFilterShowEmptyBatches, ...restSessionFilters } = sessionFilters;

    let nextFilters: InventoryFiltersUnion = { ...restSessionFilters };
    if (!_.isEqual(restFilters, restSessionFilters)) {
      nextFilters = { ...restSessionFilters };
    }

    // Since showEmptyBatches is a super special filter that unfortunately needs to
    // conform to SearchNodePayload (or refactor the ./Search and src/common/FilterGroup components), we need to change
    // the `true` and `false` values to `['true']` and `['false']`
    if (sessionFilterShowEmptyBatches) {
      nextFilters.showEmptyBatches = isArray(sessionFilterShowEmptyBatches)
        ? sessionFilterShowEmptyBatches.map((value) => `${value}`)
        : [`${sessionFilterShowEmptyBatches}`];
    }

    if (!_.isEqual(filters, nextFilters)) {
      setFilters(nextFilters);
    }
  }, [filters, sessionFilters, setFilters]);

  // Sync filterGroupFilters when filters prop changes
  useEffect(() => {
    const updates: Record<string, SearchNodePayload> = { ...initialFilters };

    if (filters.showEmptyBatches) {
      updates.showEmptyBatches = {
        field: 'showEmptyBatches',
        values: filters.showEmptyBatches,
        type: 'Exact',
        operation: 'field',
      };
    }

    if (filters.showEmptySpecies) {
      updates.showEmptySpecies = {
        field: 'showEmptySpecies',
        values: filters.showEmptySpecies,
        type: 'Exact',
        operation: 'field',
      };
    }

    if (filters.showEmptyNurseries) {
      updates.showEmptyNurseries = {
        field: 'showEmptyNurseries',
        values: filters.showEmptyNurseries,
        type: 'Exact',
        operation: 'field',
      };
    }

    setFilterGroupFilters(updates);
  }, [
    filters.showEmptyBatches,
    filters.showEmptySpecies,
    filters.showEmptyNurseries,
    setFilterGroupFilters,
    initialFilters,
  ]);

  const filterGroupColumns = useMemo<FilterField[]>(() => {
    const columnsToReturn: FilterField[] = [];
    if (origin === 'Batches') {
      columnsToReturn.push({
        name: 'showEmptyBatches',
        label: strings.FILTER_SHOW_EMPTY_BATCHES,
        showLabel: false,
        type: 'boolean',
      });
    }
    if (origin === 'Species') {
      columnsToReturn.push({
        name: 'showEmptySpecies',
        label: strings.FILTER_SHOW_EMPTY_SPECIES,
        showLabel: false,
        type: 'boolean',
      });
    }
    if (origin === 'Nursery') {
      columnsToReturn.push({
        name: 'showEmptyNurseries',
        label: strings.FILTER_SHOW_EMPTY_NURSERIES,
        showLabel: false,
        type: 'boolean',
      });
    }
    return columnsToReturn;
  }, [origin, strings]);

  const withdrawInventory = () => {
    const path = origin === 'Species' ? APP_PATHS.INVENTORY_WITHDRAW : APP_PATHS.BATCH_WITHDRAW;

    const speciesIds = selectedRows.filter((row) => row.id).map((row) => `speciesId=${String(row.id)}`);
    if (origin === 'Species' && !speciesIds.length) {
      // we can't handle deleted inventory today
      return;
    }

    const batchIds =
      origin === 'Nursery'
        ? selectedRows.flatMap((row) => row.batchIds).map((b) => `batchId=${String(b)}`)
        : selectedRows.filter((r) => r.id).map((row) => `batchId=${String(row.batchId)}`);
    const searchParams = origin === 'Species' ? speciesIds.join('&') : batchIds.join('&');

    navigate({
      pathname: path,
      search: `?${searchParams}&source=${window.location.pathname}`,
    });
  };

  const onCloseDeleteBatchesModal = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  const deleteSelectedBatches = useCallback(() => {
    const promises = selectedRows.map((r) => NurseryBatchService.deleteBatch(r.id as number));
    void Promise.allSettled(promises).then((deleteResults) => {
      if (deleteResults.some((result) => result.status === 'rejected' || result?.value?.requestSucceeded === false)) {
        snackbar.toastError();
      }
      reloadData?.();
      setOpenDeleteModal(false);
    });
  }, [reloadData, selectedRows, snackbar]);

  const isSelectionWithdrawable = () => {
    // we are woring with 'any' type rows in this table
    const hasWithdrawableQuantity = (row: any) =>
      Number(row['totalQuantity(raw)']) > 0 || Number(row['germinatingQuantity(raw)']) > 0;

    switch (origin) {
      case 'Species':
        return selectedRows.some((row) => row.id && hasWithdrawableQuantity(row));
      case 'Nursery':
        return selectedRows.length === 1 && selectedRows.some((row) => hasWithdrawableQuantity(row));
      case 'Batches': {
        const nurseries = new Set(selectedRows.map((row) => row.facility_id));
        return nurseries.size === 1 && selectedRows.some((row) => row.id && hasWithdrawableQuantity(row));
      }
    }
  };

  const totalSelectedQuantity = useMemo<number>(
    () =>
      selectedRows.reduce(
        (total, row) => total + Number(row['totalQuantity(raw)']) + Number(row['germinatingQuantity(raw)']),
        0
      ),
    [selectedRows]
  );

  useEffect(() => {
    const nurseries = new Set(selectedRows.map((row) => row.facility_id));
    if ((origin === 'Nursery' && selectedRows.length > 1) || (origin === 'Batches' && nurseries.size > 1)) {
      setWithdrawTooltip(strings.WITHDRAW_SINGLE_NURSERY);
    } else if (totalSelectedQuantity === 0) {
      setWithdrawTooltip(strings.NO_WITHDRAWABLE_QUANTITIES_FOUND);
    } else {
      setWithdrawTooltip(undefined);
    }
  }, [origin, selectedRows, strings, totalSelectedQuantity]);

  const selectAllRows = useCallback(() => {
    const newSelection: MRT_RowSelectionState = {};
    results.forEach((_row, index) => {
      newSelection[index] = true;
    });
    setRowSelection(newSelection);
  }, [results]);

  const getResultsSpeciesNames = useCallback(() => {
    return results
      .map((result: SearchResponseElement & { facilityInventories?: string }) =>
        result.facilityInventories?.split('\r')
      )
      .flat()
      .filter((species) => !!species) as string[];
  }, [results]);

  const setSearchFilters = useCallback(
    (f: InventoryFiltersUnion) => {
      setFilters(f);
      setSessionFilters(f);
    },
    [setFilters, setSessionFilters]
  );

  const projectAssignPayloadCreator = useCallback(() => {
    return { batchIds: selectedRows.map((row) => Number(row.id)) };
  }, [selectedRows]);

  // Helper functions for custom cell rendering
  const getNamesList = useCallback(
    (names: string) => {
      const namesArray = names.split('\r');
      return <TextTruncated fontSize={16} stringList={namesArray} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
    },
    [strings]
  );

  const createLinkWithQuery = useCallback(
    (path: string, value: React.ReactNode) => {
      const queryString = query.toString();
      let to = path;
      if (queryString) {
        to += `?${queryString}`;
      }
      return (
        <Link fontSize='16px' to={to}>
          {value}
        </Link>
      );
    },
    [query]
  );

  // Cell renderer components
  const ScientificNameCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.row.original.scientificName as string;
      const id = cell.row.original.id as number;
      return (
        <>
          {id ? (
            createLinkWithQuery(APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', id.toString()), value)
          ) : (
            <span>{strings.DELETED_SPECIES}</span>
          )}
        </>
      );
    },
    [createLinkWithQuery, strings]
  );

  const FacilityNameCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.row.original.facility_name as string;
      const facilityId = cell.row.original.facility_id as number;
      return (
        <>
          {facilityId ? (
            createLinkWithQuery(
              APP_PATHS.INVENTORY_ITEM_FOR_NURSERY.replace(':nurseryId', facilityId.toString()),
              value
            )
          ) : (
            <span>{value}</span>
          )}
        </>
      );
    },
    [createLinkWithQuery]
  );

  const BatchNumberCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.row.original.batchNumber as string;
      const batchId = cell.row.original.batchId as number;
      return (
        <>
          {batchId ? (
            createLinkWithQuery(APP_PATHS.INVENTORY_BATCH.replace(':batchId', batchId.toString()), value)
          ) : (
            <span>{value}</span>
          )}
        </>
      );
    },
    [createLinkWithQuery]
  );

  const FacilityInventoriesCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.row.original.facilityInventories;
      return <>{typeof value === 'string' ? getNamesList(value) : <span>{value as string}</span>}</>;
    },
    [getNamesList]
  );

  const QuantitiesMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      return <QuantitiesMenu setModalValues={setModalValues} batch={cell.row.original} />;
    },
    [setModalValues]
  );

  // Convert columns to EditableTable format
  const editableColumns = useMemo<EditableTableColumn<SearchResponseElement>[]>(() => {
    const cols = typeof columns === 'function' ? columns() : columns;
    return cols.map((col: TableColumnType) => {
      const columnDef: EditableTableColumn<SearchResponseElement> = {
        id: col.key,
        header: typeof col.name === 'string' ? col.name : '',
        accessorKey: col.key as keyof SearchResponseElement,
        enableEditing: false,
      };

      // Set filter variant based on column type
      if (col.type === 'number') {
        columnDef.filterVariant = 'range';
      } else if (col.type === 'date') {
        columnDef.filterVariant = 'date-range';
      } else if (
        col.key === 'project_name' ||
        col.key === 'scientificName' ||
        col.key === 'facilityInventories' ||
        col.key === 'species_scientificName_noLink' ||
        col.key === 'facility_name' ||
        col.key === 'facility_name_noLink'
      ) {
        // Use select dropdown for Project, Species, and Nursery columns
        columnDef.filterVariant = 'select';

        // For columns with combined names (separated by \r), split them into individual names
        if (col.key === 'facilityInventories' || col.key === 'species_scientificName_noLink') {
          const allNames = results
            .map((row: any) => row[col.key])
            .filter((val) => val !== null && val !== '' && val !== undefined)
            .flatMap((val: string) => val.split('\r'))
            .filter((name) => name.trim() !== '');
          const uniqueValues = Array.from(new Set(allNames)).sort();
          columnDef.filterSelectOptions = uniqueValues;
          // Custom filter function to check if the filter value exists in the combined string
          columnDef.filterFn = (row: any, columnId, filterValue) => {
            const cellValue = row.original[col.key] as string;
            if (!cellValue || typeof cellValue !== 'string') {
              return false;
            }
            const names = cellValue.split('\r').map((name) => name.trim());
            return names.includes(filterValue as string);
          };
        } else {
          // Get unique values for this column from results
          const uniqueValues = Array.from(
            new Set(
              results.map((row: any) => row[col.key]).filter((val) => val !== null && val !== '' && val !== undefined)
            )
          ).sort();
          columnDef.filterSelectOptions = uniqueValues;
        }
      } else {
        columnDef.filterVariant = 'text';
      }

      // Add custom cell renderers
      if (col.key === 'scientificName') {
        columnDef.Cell = ScientificNameCell;
      } else if (col.key === 'facility_name') {
        columnDef.Cell = FacilityNameCell;
      } else if (col.key === 'batchNumber') {
        columnDef.Cell = BatchNumberCell;
      } else if (col.key === 'facilityInventories') {
        columnDef.Cell = FacilityInventoriesCell;
      } else if (col.key === 'quantitiesMenu') {
        columnDef.Cell = QuantitiesMenuCell;
        columnDef.header = '';
        (columnDef as any).enableColumnFilter = false;
        (columnDef as any).enableSorting = false;
      }

      return columnDef;
    });
  }, [
    columns,
    results,
    ScientificNameCell,
    FacilityNameCell,
    BatchNumberCell,
    FacilityInventoriesCell,
    QuantitiesMenuCell,
  ]);

  // Handle sorting for EditableTable
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: origin === 'Species' ? 'scientificName' : origin === 'Nursery' ? 'facility_name' : 'batchNumber',
      desc: false,
    },
  ]);

  useEffect(() => {
    if (sorting.length > 0) {
      const sortField = sorting[0];
      setSearchSortOrder({
        field: sortField.id,
        direction: sortField.desc ? 'Descending' : 'Ascending',
      });
    }
  }, [sorting, setSearchSortOrder]);

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(() => {
    try {
      const saved = localStorage.getItem(`inventoryTable_${origin.toLowerCase()}_columnOrder`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`inventoryTable_${origin.toLowerCase()}_columnOrder`, JSON.stringify(columnOrder));
    } catch {
      // ignore
    }
  }, [columnOrder, origin]);

  const [density, setDensity] = useState<MRT_DensityState>(() => {
    try {
      return (
        (localStorage.getItem(`inventoryTable_${origin.toLowerCase()}_density`) as MRT_DensityState) || 'comfortable'
      );
    } catch {
      return 'comfortable';
    }
  });

  const [showGlobalFilter, setShowGlobalFilter] = useState(false);

  const [showColumnFilters, setShowColumnFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(`inventoryTable_${origin.toLowerCase()}_columnFilters`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {
      // ignore
    }
    return false;
  });

  return (
    <Box position={'relative'}>
      <DeleteBatchesModal open={openDeleteModal} onClose={onCloseDeleteBatchesModal} onSubmit={deleteSelectedBatches} />
      {modalValues.openChangeQuantityModal && modalValues.batch && (
        <ChangeQuantityModal
          onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
          modalValues={modalValues}
          row={modalValues.batch}
          reload={reloadData}
        />
      )}
      <Box>
        <Search
          filters={filters}
          getResultsSpeciesNames={getResultsSpeciesNames}
          onSearch={setTemporalSearchValue}
          origin={origin}
          searchValue={temporalSearchValue}
          setFilters={setSearchFilters}
          showEmptyBatchesFilter={origin === 'Batches'}
          showEmptySpeciesFilter={origin === 'Species'}
          showEmptyNurseriesFilter={origin === 'Nursery'}
          showProjectsFilter={false}
          showSearch={false}
          pillListPortalEl={pillListPortalEl}
        />
      </Box>
      <Grid item xs={12}>
        <div>
          <Grid container spacing={0} marginTop={0}>
            <Grid item xs={12}>
              <EditableTable
                columns={editableColumns}
                data={results}
                enableEditing={false}
                enableSorting={!isPresorted}
                enableGlobalFilter={true}
                enableColumnFilters={true}
                stickyFilters={true}
                storageKey={`inventoryTable_${origin.toLowerCase()}`}
                enablePagination={false}
                enableTopToolbar={true}
                enableBottomToolbar={false}
                tableOptions={{
                  state: {
                    rowSelection,
                    sorting,
                    columnOrder,
                    density,
                    showColumnFilters,
                    showGlobalFilter,
                  },
                  onRowSelectionChange: setRowSelection,
                  onSortingChange: setSorting,
                  onColumnOrderChange: setColumnOrder,
                  onShowColumnFiltersChange: setShowColumnFilters,
                  onShowGlobalFilterChange: setShowGlobalFilter,
                  onDensityChange: (updater) => {
                    setDensity((prev) => {
                      const next = typeof updater === 'function' ? updater(prev) : updater;
                      try {
                        localStorage.setItem(`inventoryTable_${origin.toLowerCase()}_density`, next);
                      } catch {
                        // ignore
                      }
                      return next;
                    });
                  },
                  enableRowSelection: true,
                  enableColumnPinning: true,
                  enableColumnActions: true,
                  enableHiding: true,
                  enableColumnDragging: true,
                  enableColumnOrdering: true,
                  positionGlobalFilter: 'right',
                  getRowId: (row, index) => String(index),
                  renderToolbarAlertBannerContent: ({ selectedAlert }) => (
                    <Box display='flex' gap={1} alignItems='center' justifyContent='space-between' width='100%'>
                      {selectedAlert}
                      <Box display='flex' gap={1} alignItems='center'>
                        <Button
                          type='destructive'
                          onClick={() => setOpenDeleteModal(true)}
                          label={strings.DELETE}
                          priority='secondary'
                        />
                        {allowSelectionProjectAssign && (
                          <ProjectAssignTopBarButton
                            totalResultsCount={results?.length}
                            selectAllRows={selectAllRows}
                            reloadData={reloadData}
                            projectAssignPayloadCreator={projectAssignPayloadCreator}
                          />
                        )}
                        <Tooltip title={withdrawTooltip || ''}>
                          <span>
                            <Button
                              type='passive'
                              onClick={withdrawInventory}
                              disabled={!isSelectionWithdrawable()}
                              label={strings.WITHDRAW}
                              priority='secondary'
                            />
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                  ),
                  renderTopToolbarCustomActions: () => (
                    <Box
                      ref={setPillListPortalEl}
                      display='flex'
                      alignItems='center'
                      sx={{ flex: 1, overflow: 'hidden' }}
                    />
                  ),
                  renderToolbarInternalActions: ({ table }) => (
                    <Box display='flex' gap={0.5}>
                      {filterGroupColumns.length > 0 && (
                        <>
                          <Tooltip title={strings.FILTER}>
                            <Button
                              id='filterInventory'
                              onClick={handleFilterClick}
                              type='passive'
                              priority='ghost'
                              icon='filter'
                            />
                          </Tooltip>
                          <Popover
                            id='inventory-filter-popover'
                            open={Boolean(filterAnchorEl)}
                            anchorEl={filterAnchorEl}
                            onClose={handleFilterClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'center',
                            }}
                            sx={{
                              '& .MuiPaper-root': {
                                borderRadius: '8px',
                                overflow: 'visible',
                                width: '480px',
                              },
                            }}
                          >
                            <FilterGroup
                              key={JSON.stringify(filterGroupFilters)}
                              initialFilters={filterGroupFilters}
                              fields={filterGroupColumns}
                              onConfirm={(_filterGroupFilters: Record<string, SearchNodePayload>) => {
                                handleFilterClose();
                                setFilterGroupFilters(_filterGroupFilters);
                                if (Object.keys(_filterGroupFilters).length === 0) {
                                  setFilters({});
                                  setSessionFilters({});
                                } else {
                                  const newFilters = { ...filters, ...convertFilterGroupToMap(_filterGroupFilters) };
                                  setFilters(newFilters);
                                  setSessionFilters(newFilters);
                                }
                              }}
                              onCancel={handleFilterClose}
                            />
                          </Popover>
                        </>
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
                  muiTableHeadCellProps: ({ column }) => ({
                    sx:
                      column.id === 'quantitiesMenu'
                        ? {
                            '& > *': {
                              display: 'none !important',
                            },
                            padding: '8px',
                          }
                        : {},
                  }),
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
                  muiToolbarAlertBannerProps: {
                    sx: {
                      backgroundColor: theme.palette.TwClrBaseGray050,
                      '.MuiPaper-root': {
                        padding: theme.spacing(1, 3),
                      },
                    },
                  },
                  muiTableBodyRowProps: {
                    sx: {
                      '& td': {
                        borderBottom: 'none',
                      },
                    },
                  },
                  localization: emptyTableMessage
                    ? {
                        noRecordsToDisplay: emptyTableMessage,
                      }
                    : undefined,
                }}
                sx={{ padding: 0 }}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Box>
  );
}
