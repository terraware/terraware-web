import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  CircularProgress,
  IconButton,
  Checkbox as MuiCheckbox,
  Popover,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Button, Checkbox, EditableTable, EditableTableColumn } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_Row,
  MRT_RowSelectionState,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TfButton from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import WithdrawSeedsModal from 'src/scenes/AccessionsRouter/withdraw/WithdrawSeedsModal';
import strings from 'src/strings';
import { isWithdrawableAccessionState } from 'src/types/Accession';
import { Project } from 'src/types/Project';
import { SearchResponseElementWithId } from 'src/types/Search';
import { makeCsv } from 'src/utils/csv';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type SpeciesRow = {
  id: string;
  speciesId: number | undefined;
  speciesName: string;
  species_commonName: string;
  project_name: string;
  totalSeeds: number;
  dryingSeeds: number;
  inStorageSeeds: number;
  accessionCount: number;
  usedUpAccessionCount: number;
  // Ids of this species' withdrawable (not used-up) accessions, for bulk withdrawal.
  accessionIds: number[];
};

const TABLE_STATE_STORAGE_KEY = 'accessions-database-species-table-v4';

const DEFAULT_COLUMN_ORDER = [
  'speciesName',
  'species_commonName',
  'project_name',
  'dryingSeeds',
  'inStorageSeeds',
  'totalSeeds',
];

type AccessionsBySpeciesTableProps = {
  searchResults: SearchResponseElementWithId[] | null | undefined;
  reloadData?: () => void;
};

export default function AccessionsBySpeciesTable({
  searchResults,
  reloadData,
}: AccessionsBySpeciesTableProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { user, isAllowed } = useUser();
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { availableProjects: projects } = useProjects();
  // Contributors cannot edit accessions, so they must not reach the withdrawal flow (its mutation
  // would be rejected). Gate the selection/withdraw entry point on the same permission the
  // Accession Details withdraw button uses.
  const canWithdraw = isAllowed('EDIT_ACCESSION', { organization: selectedOrganization });

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [withdrawAccessionIds, setWithdrawAccessionIds] = useState<number[]>();

  const uniqueProjectNames = useMemo(
    () =>
      (projects || [])
        .map((p: Project) => p.name)
        .filter((name): name is string => !!name)
        .sort(),
    [projects]
  );

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
    defaultColumnVisibility: { dryingSeeds: false, inStorageSeeds: false },
    defaultSorting: [{ id: 'speciesName', desc: false }],
    persistedMultiSelectColumnIds: ['project_name', 'speciesName'],
  });

  const [showAllUsedUp, setShowAllUsedUp] = useState(false);
  const [draftShowAllUsedUp, setDraftShowAllUsedUp] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchorEl);
  useEffect(() => {
    if (filterOpen) {
      setDraftShowAllUsedUp(showAllUsedUp);
    }
  }, [filterOpen, showAllUsedUp]);
  const handleFilterClick = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      setFilterAnchorEl(event.currentTarget);
    }
  }, []);
  const handleFilterClose = useCallback(() => setFilterAnchorEl(null), []);
  const handleFilterReset = useCallback(() => setDraftShowAllUsedUp(false), []);
  const handleFilterApply = useCallback(() => {
    setShowAllUsedUp(draftShowAllUsedUp);
    setFilterAnchorEl(null);
  }, [draftShowAllUsedUp]);

  const allSpeciesRows = useMemo<SpeciesRow[]>(() => {
    if (!searchResults) {
      return [];
    }
    const grouped = new Map<string, SpeciesRow>();
    for (const accession of searchResults) {
      const speciesId = accession.species_id as number | undefined;
      const speciesName = (accession.speciesName as string) ?? '';
      // Skip accessions that have neither a species ID nor a species name.
      if (speciesId === undefined && !speciesName) {
        continue;
      }
      const key = speciesId !== undefined ? `id:${speciesId}` : `name:${speciesName}`;
      const existing = grouped.get(key);
      const seeds = Number(accession['estimatedCount(raw)'] ?? 0) || 0;
      const isUsedUp = accession.state === 'Used Up';
      const isWithdrawable = isWithdrawableAccessionState(accession.state as string | undefined);
      const isDrying = accession.state === 'Drying';
      const isInStorage = accession.state === 'In Storage';
      const projectName = (accession.project_name as string) ?? '';
      const accessionId = accession.id !== undefined ? Number(accession.id) : undefined;
      if (existing) {
        existing.totalSeeds += seeds;
        existing.accessionCount += 1;
        if (isUsedUp) {
          existing.usedUpAccessionCount += 1;
        }
        if (isWithdrawable && accessionId !== undefined) {
          existing.accessionIds.push(accessionId);
        }
        if (isDrying) {
          existing.dryingSeeds += seeds;
        }
        if (isInStorage) {
          existing.inStorageSeeds += seeds;
        }
        if (projectName && !existing.project_name.split(', ').includes(projectName)) {
          existing.project_name = existing.project_name ? `${existing.project_name}, ${projectName}` : projectName;
        }
      } else {
        grouped.set(key, {
          id: key,
          speciesId,
          speciesName,
          species_commonName: (accession.species_commonName as string) ?? '',
          project_name: projectName,
          totalSeeds: seeds,
          dryingSeeds: isDrying ? seeds : 0,
          inStorageSeeds: isInStorage ? seeds : 0,
          accessionCount: 1,
          usedUpAccessionCount: isUsedUp ? 1 : 0,
          accessionIds: isWithdrawable && accessionId !== undefined ? [accessionId] : [],
        });
      }
    }
    return Array.from(grouped.values());
  }, [searchResults]);

  const speciesRows = useMemo<SpeciesRow[]>(() => {
    if (showAllUsedUp) {
      return allSpeciesRows;
    }

    return allSpeciesRows.filter((row) => row.usedUpAccessionCount < row.accessionCount);
  }, [allSpeciesRows, showAllUsedUp]);

  const selectedSpeciesRows = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((id) => speciesRows.find((row) => row.id === id))
        .filter((row): row is SpeciesRow => row !== undefined),
    [rowSelection, speciesRows]
  );

  // A bulk withdrawal is single-species. Selecting one species row withdraws from all its
  // (non-used-up) accessions; selecting two rows means two species, which is not allowed.
  const isSelectionBulkWithdrawable =
    selectedSpeciesRows.length === 1 && selectedSpeciesRows[0].accessionIds.length > 0;

  const withdrawTooltip = isSelectionBulkWithdrawable ? undefined : strings.WITHDRAW_SAME_SPECIES_ONLY;

  const bulkWithdrawSelectedRows = useCallback(() => {
    if (selectedSpeciesRows.length === 1 && selectedSpeciesRows[0].accessionIds.length > 0) {
      setWithdrawAccessionIds(selectedSpeciesRows[0].accessionIds);
    }
  }, [selectedSpeciesRows]);

  const onWithdrawn = useCallback(() => {
    setRowSelection({});
    reloadData?.();
  }, [reloadData]);

  // Custom select cell: once a species row is selected, every other species row's checkbox is
  // disabled and wrapped in a tooltip (a nursery batch is single-species).
  const SelectRowCheckboxCell = useCallback(
    ({ row }: { row: MRT_Row<SpeciesRow> }) => {
      const hasWithdrawable = row.original.accessionIds.length > 0;
      const sameSpecies = selectedSpeciesRows.length === 0 || selectedSpeciesRows[0].id === row.original.id;
      const canSelect = hasWithdrawable && sameSpecies;
      const checkbox = (
        <MuiCheckbox
          size='small'
          checked={row.getIsSelected()}
          disabled={!canSelect}
          onChange={row.getToggleSelectedHandler()}
          inputProps={{ 'aria-label': 'Toggle select row' }}
        />
      );
      if (canSelect) {
        return checkbox;
      }
      const tooltip = !hasWithdrawable
        ? strings.WITHDRAW_ACCESSION_NOT_AVAILABLE
        : strings.BULK_WITHDRAW_ONE_SPECIES_TOOLTIP;
      return (
        <Tooltip title={tooltip}>
          <span>{checkbox}</span>
        </Tooltip>
      );
    },
    [selectedSpeciesRows]
  );

  const uniqueSpeciesNames = useMemo(
    () => Array.from(new Set(speciesRows.map((r) => r.speciesName).filter((name): name is string => !!name))).sort(),
    [speciesRows]
  );

  const SpeciesNameCell = useCallback(({ cell }: { cell: MRT_Cell<SpeciesRow> }) => {
    const row = cell.row.original;
    if (row.speciesId === undefined) {
      return <span>{row.speciesName || strings.DELETED_SPECIES}</span>;
    }
    const params = new URLSearchParams({ tab: 'byAccession', speciesId: String(row.speciesId) });
    return (
      <Link fontSize='16px' to={`${APP_PATHS.ACCESSIONS}?${params.toString()}`}>
        {row.speciesName}
      </Link>
    );
  }, []);

  const SpeciesNumericCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SpeciesRow> }) => {
      const value = cell.getValue() as number | undefined | null;
      return value !== undefined && value !== null ? <span>{numberFormatter.format(value)}</span> : null;
    },
    [numberFormatter]
  );

  const speciesColumns = useMemo<EditableTableColumn<SpeciesRow>[]>(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        id: 'speciesName',
        header: strings.SPECIES,
        accessorKey: 'speciesName',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueSpeciesNames,
        Cell: SpeciesNameCell,
      },
      {
        id: 'species_commonName',
        header: strings.COMMON_NAME,
        accessorKey: 'species_commonName',
        filterVariant: 'text',
      },
      {
        id: 'project_name',
        header: strings.PROJECT,
        accessorKey: 'project_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
        filterFn: (row: SpeciesRow, columnId, filterValue: string[]) => {
          if (!filterValue.length) {
            return true;
          }
          const cellValue =
            ((row as unknown as { getValue: (id: string) => unknown }).getValue(columnId) as string) ?? '';
          const rowProjects = cellValue
            .split(', ')
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
          return rowProjects.some((p) => filterValue.includes(p));
        },
      },
      {
        id: 'dryingSeeds',
        header: strings.DRYING,
        accessorKey: 'dryingSeeds',
        filterVariant: 'range',
        Cell: SpeciesNumericCell,
      },
      {
        id: 'inStorageSeeds',
        header: strings.IN_STORAGE,
        accessorKey: 'inStorageSeeds',
        filterVariant: 'range',
        Cell: SpeciesNumericCell,
      },
      {
        id: 'totalSeeds',
        header: strings.TOTAL_SEEDS,
        accessorKey: 'totalSeeds',
        filterVariant: 'range',
        Cell: SpeciesNumericCell,
      },
    ];
  }, [activeLocale, uniqueProjectNames, uniqueSpeciesNames, SpeciesNameCell, SpeciesNumericCell]);

  const downloadReportHandler = useCallback((table: MRT_TableInstance<SpeciesRow>) => {
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
    link.setAttribute('download', 'accessions-by-species.csv');
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
      {canWithdraw && user && withdrawAccessionIds && (
        <WithdrawSeedsModal
          open={withdrawAccessionIds !== undefined}
          onClose={() => setWithdrawAccessionIds(undefined)}
          accessionIds={withdrawAccessionIds}
          user={user}
          onWithdrawn={onWithdrawn}
        />
      )}
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={speciesColumns}
        data={speciesRows}
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
            ...(canWithdraw ? { rowSelection } : {}),
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
          getRowId: (row) => row.id,
          ...(canWithdraw
            ? {
                enableRowSelection: (row: MRT_Row<SpeciesRow>) =>
                  row.original.accessionIds.length > 0 &&
                  (selectedSpeciesRows.length === 0 || selectedSpeciesRows[0].id === row.original.id),
                displayColumnDefOptions: { 'mrt-row-select': { Cell: SelectRowCheckboxCell } },
                onRowSelectionChange: setRowSelection,
                renderToolbarAlertBannerContent: ({ selectedAlert }: { selectedAlert: React.ReactNode }) => (
                  <Box display='flex' flexDirection='column' width='100%'>
                    <Box
                      display='flex'
                      gap={1}
                      alignItems='center'
                      justifyContent='space-between'
                      width='100%'
                      padding={theme.spacing(1, 3)}
                    >
                      {selectedAlert}
                      <Tooltip title={withdrawTooltip || ''}>
                        <span>
                          <TfButton
                            type='productive'
                            onClick={bulkWithdrawSelectedRows}
                            disabled={!isSelectionBulkWithdrawable}
                            label={strings.WITHDRAW}
                            priority='secondary'
                          />
                        </span>
                      </Tooltip>
                    </Box>
                    {isSelectionBulkWithdrawable && (
                      <Box
                        display='flex'
                        alignItems='center'
                        gap={1}
                        sx={{ backgroundColor: theme.palette.TwClrBgSuccessTertiary, padding: theme.spacing(1.5, 3) }}
                      >
                        <Icon name='info' size='medium' fillColor={theme.palette.TwClrIcnSuccess} />
                        <Typography fontSize='14px' color={theme.palette.TwClrTxtSuccess}>
                          {strings
                            .formatString(strings.BULK_WITHDRAW_SPECIES_BANNER, selectedSpeciesRows[0].speciesName)
                            .toString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ),
                muiToolbarAlertBannerProps: {
                  sx: {
                    backgroundColor: theme.palette.TwClrBaseGray050,
                    padding: 0,
                    '.MuiAlert-message': { padding: 0, flexGrow: 1, width: '100%', maxWidth: 'none' },
                  },
                },
              }
            : {}),
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
              <Tooltip title={strings.EXPORT}>
                <IconButton onClick={() => downloadReportHandler(table)}>
                  <Icon name='iconExport' size='medium' />
                </IconButton>
              </Tooltip>
              <Tooltip title={strings.FILTER}>
                <Button
                  id='filterAccessionsBySpecies'
                  onClick={handleFilterClick}
                  type='passive'
                  priority='ghost'
                  icon='filter'
                />
              </Tooltip>
              <Popover
                id='accessions-by-species-filter-popover'
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: '8px',
                    overflow: 'visible',
                    width: '480px',
                  },
                }}
              >
                <Box display='flex' flexDirection='column'>
                  <Box
                    sx={{
                      background: theme.palette.TwClrBgSecondary,
                      borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                      borderRadius: theme.spacing(1, 1, 0, 0),
                      padding: theme.spacing(2, 3),
                    }}
                  >
                    <Typography fontSize='20px' fontWeight={600}>
                      {strings.FILTERS}
                    </Typography>
                  </Box>
                  <Box padding={theme.spacing(2, 3)}>
                    <Checkbox
                      id='showAllUsedUp'
                      name='showAllUsedUp'
                      label={strings.SHOW_SPECIES_WITH_ALL_ACCESSIONS_USED_UP}
                      value={draftShowAllUsedUp}
                      onChange={setDraftShowAllUsedUp}
                    />
                  </Box>
                  <Box
                    display='flex'
                    justifyContent='flex-end'
                    gap={1}
                    sx={{
                      background: theme.palette.TwClrBgSecondary,
                      borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                      borderRadius: theme.spacing(0, 0, 1, 1),
                      padding: theme.spacing(2, 3),
                    }}
                  >
                    <Button onClick={handleFilterClose} type='passive' priority='secondary' label={strings.CANCEL} />
                    <Button onClick={handleFilterReset} type='passive' priority='secondary' label={strings.RESET} />
                    <Button onClick={handleFilterApply} type='productive' priority='primary' label={strings.APPLY} />
                  </Box>
                </Box>
              </Popover>
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
          muiTablePaperProps: { elevation: 0 },
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
