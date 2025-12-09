import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { useLocalization } from 'src/providers';
import { ObservationSpeciesResults } from 'src/types/Observations';

type SpeciesEditableTableProps = {
  species?: ObservationSpeciesResults[];
  observationId: number;
  plotId: number;
  reload: () => void;
};

export default function SpeciesEditableTable({ species }: SpeciesEditableTableProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();

  const columns = useMemo<MRT_ColumnDef<ObservationSpeciesResults>[]>(
    () => [
      {
        accessorKey: 'speciesScientificName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      {
        accessorKey: 'totalExisting',
        header: strings.PREEXISTING,
        enableEditing: false,
      },
      {
        accessorKey: 'totalLive',
        header: strings.LIVE_PLANTS,
        enableEditing: false,
      },
      {
        accessorKey: 'totalDead',
        header: strings.DEAD_PLANTS,
        enableEditing: false,
      },
    ],
    [strings]
  );

  const table = useMaterialReactTable({
    columns,
    data: species || [],
    editDisplayMode: 'cell',
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableEditing: true,
    enableSorting: true,
    enableFilters: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
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
    muiTableBodyRowProps: {
      sx: {
        '& td': {
          borderBottom: 'none',
        },
      },
    },
  });

  return (
    <Box minHeight={'160px'} padding={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
}
