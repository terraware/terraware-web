import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { Button, EditableTable, EditableTableColumn, Icon, TableColumnType } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_RowSelectionState,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import ProjectAssignTopBarButton from 'src/components/ProjectAssignTopBarButton';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers';
import { isBatchEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import { NurseryBatchService } from 'src/services';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { downloadCsv } from 'src/utils/csv';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import BatchWithdrawModal from '../BatchWithdrawModal';
import { OriginPage } from '../InventoryBatchView';
import BatchDetailsModal from './BatchDetailsModal';
import ChangeQuantityModal from './ChangeQuantityModal';
import DeleteBatchesModal from './DeleteBatchesModal';
import QuantitiesMenu from './QuantitiesMenu';

export interface InventorySeedlingsTableProps {
  speciesId?: number;
  facilityId?: number;
  modified: number;
  setModified: (val: number) => void;
  openBatchNumber: string | null;
  onUpdateOpenBatch: (batchNum: string | null) => void;
  origin: OriginPage;
  columns: TableColumnType[] | (() => TableColumnType[]);
  isSelectionBulkWithdrawable: (selectedRows: SearchResponseElement[]) => boolean;
  getFuzzySearchFields: (debouncedSearchTerm: string) => FieldNodePayload[];
  // Origin ID is either the facility ID or the species ID
  getBatchesSearch: (
    orgId: number,
    originId: number,
    searchFields: FieldNodePayload[],
    searchSortOrder: SearchSortOrder | undefined
  ) => Promise<SearchResponseElement[] | null>;
}

export default function InventorySeedlingsTable(props: InventorySeedlingsTableProps): JSX.Element {
  const {
    modified,
    setModified,
    openBatchNumber,
    onUpdateOpenBatch,
    origin,
    columns,
    isSelectionBulkWithdrawable,
    getBatchesSearch,
  } = props;
  const originId: number | undefined = props.facilityId || props.speciesId;

  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { availableProjects: projects } = useProjects();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();
  const numberFormatter = useNumberFormatter();
  const tableStorageKey = `inventorySeedlingsTable_${origin.toLowerCase()}`;

  const [batches, setBatches] = useState<SearchResponseElement[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<SearchResponseElement[]>([]);
  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openNewBatchModal, setOpenNewBatchModal] = useState<boolean>(false);
  const [modalValues, setModalValues] = useState<{ type: string; openChangeQuantityModal: boolean; batch?: any }>({
    type: 'germinating',
    openChangeQuantityModal: false,
  });

  const selectedRows = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((id) => filteredBatches.find((batch) => String(batch.id) === id))
        .filter((row): row is SearchResponseElement => row !== undefined),
    [rowSelection, filteredBatches]
  );

  useEffect(() => {
    if (
      (origin === 'Species' || origin === 'Nursery') &&
      batches.length > 0 &&
      batches.filter((batch: SearchResponseElement) => !isBatchEmpty(batch)).length === 0
    ) {
      setFilters({ showEmptyBatches: ['true'] });
    }
  }, [batches, origin, setFilters]);

  const filterEmptyBatches = useCallback(
    (unfiltered: SearchResponseElement[]) => {
      const showEmptyBatches = (filters.showEmptyBatches || [])[0] === 'true';
      return unfiltered.filter((batch: SearchResponseElement) => (showEmptyBatches ? true : !isBatchEmpty(batch)));
    },
    [filters.showEmptyBatches]
  );

  const getNonSpeciesSearchFields = useCallback(() => {
    const fields: FieldNodePayload[] = [];

    if (filters.facilityIds && filters.facilityIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'facility_id',
        type: 'Exact',
        values: filters.facilityIds.map((id) => id.toString()),
      });
    }

    if (filters.projectIds && filters.projectIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'project_id',
        type: 'Exact',
        values: filters.projectIds.map((id) => (id === null ? id : id.toString())),
      });
    }

    return fields;
  }, [filters.facilityIds, filters.projectIds]);

  const getSearchFields = useCallback(() => {
    const fields: FieldNodePayload[] = getNonSpeciesSearchFields();

    if (filters.speciesIds && filters.speciesIds.length > 0) {
      fields.push({
        operation: 'field',
        field: 'species_id',
        type: 'Exact',
        values: filters.speciesIds.map((id) => id.toString()),
      });
    }

    return fields;
  }, [getNonSpeciesSearchFields, filters.speciesIds]);

  useEffect(() => {
    const requestId = setRequestId('inventory-seedlings');

    const populateResults = async () => {
      if (!originId || !selectedOrganization || !activeLocale) {
        return;
      }

      const searchFields = getSearchFields();
      const batchesResults = await getBatchesSearch(selectedOrganization.id, originId, searchFields, undefined);

      if (requestId === getRequestId('inventory-seedlings')) {
        setBatches(batchesResults || []);
      }
    };

    if (!originId || !isNaN(originId)) {
      void populateResults();
    }
  }, [activeLocale, filters.facilityIds, getBatchesSearch, getSearchFields, modified, originId, selectedOrganization]);

  useEffect(() => {
    const batch = batches.find((b) => b.batchNumber === openBatchNumber);
    if (batch) {
      const batchId = batch.id as number | string;
      if (origin === 'Nursery') {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH_FOR_NURSERY.replace(':nurseryId', `${originId}`).replace(
            ':batchId',
            `${batchId}`
          ),
        });
      } else {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', `${originId}`).replace(
            ':batchId',
            `${batchId}`
          ),
        });
      }
    }
  }, [batches, navigate, openBatchNumber, origin, originId]);

  useEffect(() => {
    setFilteredBatches(filterEmptyBatches(batches));
  }, [batches, filterEmptyBatches]);

  const reloadData = useCallback(() => {
    setModified(Date.now());
  }, [setModified]);

  const addBatch = () => {
    setOpenNewBatchModal(true);
    reloadData();
  };

  const deleteSelectedBatches = useCallback(() => {
    const promises = selectedRows.map((r) => NurseryBatchService.deleteBatch(r.id as number));
    void Promise.allSettled(promises).then((results) => {
      if (results.some((result) => result.status === 'rejected' || result?.value?.requestSucceeded === false)) {
        snackbar.toastError();
      }
      reloadData();
      setOpenDeleteModal(false);
    });
  }, [reloadData, selectedRows, snackbar]);

  const selectAllRows = useCallback(() => {
    const newSelection: MRT_RowSelectionState = {};
    filteredBatches.forEach((_row, index) => {
      newSelection[index] = true;
    });
    setRowSelection(newSelection);
  }, [filteredBatches]);

  const [withdrawModalBatchIds, setWithdrawModalBatchIds] = useState<number[] | undefined>(undefined);

  const bulkWithdrawSelectedRows = useCallback(() => {
    const ids = selectedRows.map((row) => Number(row.id));
    if (ids.length === 0) {
      return;
    }
    setWithdrawModalBatchIds(ids);
    return;
  }, [selectedRows]);

  const totalSelectedQuantity = useMemo<number>(
    () =>
      selectedRows.reduce(
        (total, row) => total + Number(row['totalQuantity(raw)']) + Number(row['germinatingQuantity(raw)']),
        0
      ),
    [selectedRows]
  );

  const withdrawTooltip = useMemo<string | undefined>(() => {
    if (!isSelectionBulkWithdrawable(selectedRows)) {
      return strings.WITHDRAW_SINGLE_NURSERY;
    } else if (totalSelectedQuantity === 0) {
      return strings.NO_WITHDRAWABLE_QUANTITIES_FOUND;
    }
    return undefined;
  }, [isSelectionBulkWithdrawable, selectedRows, strings, totalSelectedQuantity]);

  const handleExport = useCallback((table: MRT_TableInstance<SearchResponseElement>) => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => !col.id.startsWith('mrt-') && col.id !== 'quantitiesMenu' && col.id !== 'withdraw');
    const filteredRows = table.getSortedRowModel().rows;

    const escape = (val: unknown): string => {
      const s = val === null || val === undefined ? '' : String(val).replace(/\r/g, ', ');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const headers = visibleColumns.map((col) => {
      const h = col.columnDef.header;
      return escape(typeof h === 'string' ? h : col.id);
    });

    const csvLines = [
      headers.join(','),
      ...filteredRows.map((row) => visibleColumns.map((col) => escape(row.getValue(col.id))).join(',')),
    ];

    downloadCsv('inventory-species', csvLines.join('\n'));
  }, []);

  // Cell renderers
  const BatchNumberCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const batchId = cell.row.original.id as number;
      const value = cell.row.original.batchNumber as string;
      let to = APP_PATHS.INVENTORY_BATCH.replace(':batchId', String(batchId));
      if (origin === 'Nursery') {
        to = APP_PATHS.INVENTORY_BATCH_FOR_NURSERY.replace(':nurseryId', `${originId}`).replace(
          ':batchId',
          String(batchId)
        );
      } else if (origin === 'Species') {
        to = APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', `${originId}`).replace(
          ':batchId',
          String(batchId)
        );
      }
      return (
        <Link fontSize='16px' to={to}>
          {value}
        </Link>
      );
    },
    [origin, originId]
  );

  const WithdrawCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const batch = cell.row.original;
      const totalQuantity = Number(batch.totalQuantity) + Number(batch.germinatingQuantity);
      return (
        <Button
          id='withdraw-batch'
          label={strings.WITHDRAW}
          onClick={() => {
            setWithdrawModalBatchIds([Number(batch.id)]);
          }}
          size='small'
          priority='secondary'
          disabled={totalQuantity === 0}
        />
      );
    },
    [strings]
  );

  const QuantityCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      const value = cell.getValue();
      const num = Number(value);
      return <span>{isNaN(num) ? String(value ?? '') : numberFormatter.format(num)}</span>;
    },
    [numberFormatter]
  );

  const QuantitiesMenuCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchResponseElement> }) => {
      return <QuantitiesMenu setModalValues={setModalValues} batch={cell.row.original} />;
    },
    [setModalValues]
  );

  const editableColumns = useMemo<EditableTableColumn<SearchResponseElement>[]>(() => {
    const cols = typeof columns === 'function' ? columns() : columns;
    return cols.map((col: TableColumnType) => {
      const columnDef: EditableTableColumn<SearchResponseElement> = {
        id: col.key,
        header: typeof col.name === 'string' ? col.name : '',
        accessorKey: col.key as keyof SearchResponseElement,
        enableEditing: false,
      };

      if (col.type === 'number') {
        columnDef.filterVariant = 'range';
        columnDef.sortingFn = 'alphanumeric';
      } else if (col.type === 'date') {
        columnDef.filterVariant = 'date-range';
      } else if (col.key === 'project_name') {
        columnDef.filterVariant = 'multi-select';
        columnDef.filterSelectOptions = (projects || [])
          .map((project) => project.name)
          .filter((name): name is string => !!name)
          .sort();
      } else if (col.key === 'species_scientificName') {
        columnDef.filterVariant = 'select';
        columnDef.filterSelectOptions = Array.from(
          new Set(
            filteredBatches
              .map((row: any) => row[col.key])
              .filter((val): val is string => typeof val === 'string' && val !== '')
          )
        ).sort();
      } else {
        columnDef.filterVariant = 'text';
      }

      if (col.key === 'batchNumber') {
        columnDef.Cell = BatchNumberCell;
      } else if (col.key === 'withdraw') {
        columnDef.Cell = WithdrawCell;
        columnDef.header = '';
        (columnDef as any).enableColumnFilter = false;
        (columnDef as any).enableSorting = false;
      } else if (col.key.includes('Quantity')) {
        columnDef.Cell = QuantityCell;
      } else if (col.key === 'quantitiesMenu') {
        columnDef.Cell = QuantitiesMenuCell;
        columnDef.header = '';
        (columnDef as any).enableColumnFilter = false;
        (columnDef as any).enableSorting = false;
      }

      return columnDef;
    });
  }, [columns, projects, filteredBatches, BatchNumberCell, WithdrawCell, QuantityCell, QuantitiesMenuCell]);

  const {
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    onPaginationChange,
    pagination,
    setColumnOrder,
    setColumnVisibility,
    setShowColumnFilters,
    setShowGlobalFilter,
    showColumnFilters,
    showGlobalFilter,
  } = useTableState(tableStorageKey);

  return (
    <>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: theme.palette.TwClrBg,
        }}
      >
        {openNewBatchModal && (
          <BatchDetailsModal
            reload={reloadData}
            onClose={() => {
              onUpdateOpenBatch(null);
              setOpenNewBatchModal(false);
            }}
            originId={originId}
            origin={origin}
          />
        )}
        <DeleteBatchesModal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onSubmit={deleteSelectedBatches}
        />
        {withdrawModalBatchIds && (
          <BatchWithdrawModal
            open={true}
            onClose={() => setWithdrawModalBatchIds(undefined)}
            batchIds={withdrawModalBatchIds}
          />
        )}
        {modalValues.openChangeQuantityModal && modalValues.batch && (
          <ChangeQuantityModal
            onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
            modalValues={modalValues}
            row={modalValues.batch}
            reload={reloadData}
          />
        )}
        <Grid item xs={12} sx={{ marginTop: theme.spacing(1) }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>{strings.SEEDLING_BATCHES}</Typography>
            <Box display='flex' alignItems='center'>
              <Button
                id='new-batch'
                icon='plus'
                label={isMobile ? '' : strings.ADD_BATCH}
                onClick={addBatch}
                size='small'
              />
            </Box>
          </Box>

          <EditableTable
            clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
            columns={editableColumns}
            data={filteredBatches}
            enableEditing={false}
            enableSorting={true}
            enableGlobalFilter={true}
            enableColumnFilters={true}
            stickyFilters={true}
            storageKey={tableStorageKey}
            enablePagination={true}
            enableTopToolbar={true}
            enableBottomToolbar={true}
            tableOptions={{
              state: {
                rowSelection,
                columnOrder,
                columnVisibility,
                density,
                pagination,
                showColumnFilters,
                showGlobalFilter,
              },
              onRowSelectionChange: setRowSelection,
              onPaginationChange,
              onColumnOrderChange: setColumnOrder,
              onColumnVisibilityChange: setColumnVisibility,
              onShowColumnFiltersChange: setShowColumnFilters,
              onShowGlobalFilterChange: setShowGlobalFilter,
              onDensityChange,
              enableRowSelection: true,
              enableColumnPinning: true,
              enableColumnActions: true,
              enableHiding: true,
              enableColumnDragging: true,
              enableColumnOrdering: true,
              positionGlobalFilter: 'right',
              getRowId: (row) => String(row.id),
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
                    <ProjectAssignTopBarButton
                      totalResultsCount={filteredBatches?.length}
                      selectAllRows={selectAllRows}
                      reloadData={reloadData}
                      projectAssignPayloadCreator={() => ({ batchIds: selectedRows.map((row) => Number(row.id)) })}
                    />
                    <Tooltip title={withdrawTooltip || ''}>
                      <span>
                        <Button
                          type='passive'
                          onClick={bulkWithdrawSelectedRows}
                          disabled={!isSelectionBulkWithdrawable(selectedRows) || !totalSelectedQuantity}
                          label={strings.WITHDRAW}
                          priority='secondary'
                        />
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              ),
              renderToolbarInternalActions: ({ table }) => (
                <Box display='flex' gap={0.5}>
                  <Tooltip title={strings.EXPORT}>
                    <IconButton onClick={() => handleExport(table)}>
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
              muiTableBodyCellProps: ({ row, column }) => ({ id: `row${row.index + 1}-${column.id}` }),
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
                  column.id === 'quantitiesMenu' || column.id === 'withdraw'
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
                  '.MuiAlert-message': {
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
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}
