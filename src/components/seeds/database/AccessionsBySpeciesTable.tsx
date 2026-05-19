import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, CircularProgress, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useTableState from 'src/hooks/useTableState';
import { useLocalization } from 'src/providers/hooks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { SearchResponseElementWithId } from 'src/types/Search';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

export type SpeciesRow = {
  id: string;
  speciesId: number | undefined;
  speciesName: string;
  species_commonName: string;
  project_name: string;
  totalSeeds: number;
  totalWithdrawn: number;
};

const TABLE_STATE_STORAGE_KEY = 'accessions-database-species-table-v3';

const DEFAULT_COLUMN_ORDER = ['speciesName', 'species_commonName', 'project_name', 'totalSeeds', 'totalWithdrawn'];

type AccessionsBySpeciesTableProps = {
  searchResults: SearchResponseElementWithId[] | null | undefined;
};

export default function AccessionsBySpeciesTable({ searchResults }: AccessionsBySpeciesTableProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const projects = useAppSelector(selectProjects);

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
    defaultColumnVisibility: {},
    defaultSorting: [{ id: 'speciesName', desc: false }],
    persistedMultiSelectColumnIds: ['project_name', 'speciesName'],
  });

  const speciesRows = useMemo<SpeciesRow[]>(() => {
    if (!searchResults) {
      return [];
    }
    const grouped = new Map<string, SpeciesRow>();
    for (const accession of searchResults) {
      const speciesId = accession.species_id as number | undefined;
      const speciesName = (accession.speciesName as string) ?? '';
      const key = speciesId !== undefined ? `id:${speciesId}` : `name:${speciesName}`;
      const existing = grouped.get(key);
      const seeds = Number(accession['estimatedCount(raw)'] ?? 0) || 0;
      const withdrawn = Number(accession['totalWithdrawnCount(raw)'] ?? 0) || 0;
      const projectName = (accession.project_name as string) ?? '';
      if (existing) {
        existing.totalSeeds += seeds;
        existing.totalWithdrawn += withdrawn;
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
          totalWithdrawn: withdrawn,
        });
      }
    }
    return Array.from(grouped.values());
  }, [searchResults]);

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
        id: 'totalSeeds',
        header: strings.TOTAL_SEEDS,
        accessorKey: 'totalSeeds',
        filterVariant: 'range',
        Cell: SpeciesNumericCell,
      },
      {
        id: 'totalWithdrawn',
        header: strings.TOTAL_WITHDRAWN,
        accessorKey: 'totalWithdrawn',
        filterVariant: 'range',
        Cell: SpeciesNumericCell,
      },
    ];
  }, [activeLocale, uniqueProjectNames, uniqueSpeciesNames, SpeciesNameCell, SpeciesNumericCell]);

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
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
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
