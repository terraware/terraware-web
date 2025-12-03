import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  BiomassSpeciesUpdateOperationPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';

type SpeciesRow = {
  abundancePercent?: number;
  speciesId?: number;
  speciesName?: string;
  scientificName?: string;
  isInvasive?: boolean;
  isThreatened?: boolean;
};

type QuadratSpeciesEditableTableProps = {
  species?: SpeciesRow[];
  quadrat?: string;
  observationId: number;
  plotId: number;
  reload: () => void;
};

export default function QuadratSpeciesEditableTable({
  species,
  observationId,
  plotId,
  reload,
}: QuadratSpeciesEditableTableProps): JSX.Element {
  const { species: availableSpecies } = useSpeciesData();
  const theme = useTheme();
  const { strings } = useLocalization();
  const [update, updateResult] = useUpdateCompletedObservationPlotMutation();

  useEffect(() => {
    if (updateResult.isSuccess) {
      reload();
    }
  }, [reload, updateResult]);
  const saveValue = useCallback(
    (fieldId: string, speciesId?: number, scientificName?: string) => (event: { currentTarget: { value: any } }) => {
      const value = event.currentTarget.value;
      if (value !== undefined && (speciesId || scientificName)) {
        const uploadPayload: BiomassSpeciesUpdateOperationPayload = {
          type: 'BiomassSpecies',
          speciesId,
          scientificName,
          [fieldId]: value,
        };
        const mainPayload = {
          observationId,
          plotId,
          updateObservationRequestPayload: { updates: [uploadPayload] },
        };
        void update(mainPayload);
      }
    },
    [update, observationId, plotId]
  );

  const columns = useMemo<MRT_ColumnDef<SpeciesRow>[]>(
    () => [
      {
        accessorKey: 'speciesName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      {
        accessorKey: 'abundancePercent',
        header: strings.HERBACEOUS_ABUNDANCE_PERCENT,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('abundancePercent', row.original.speciesId, row.original.scientificName),
        }),
      },
      {
        accessorKey: 'isInvasive',
        Cell: ({ cell }) => (cell.getValue() ? strings.YES : strings.NO),
        header: strings.INVASIVE,
        editVariant: 'select',
        editSelectOptions: [
          { label: strings.YES, value: 'true' },
          { label: strings.NO, value: 'false' },
        ],
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
            const value = event.target.value === 'true';
            const uploadPayload: BiomassSpeciesUpdateOperationPayload = {
              type: 'BiomassSpecies',
              speciesId: row.original.speciesId,
              scientificName: row.original.scientificName,
              isInvasive: value,
            };
            const mainPayload = {
              observationId,
              plotId,
              updateObservationRequestPayload: { updates: [uploadPayload] },
            };
            void update(mainPayload);
          },
        }),
      },
      {
        accessorKey: 'isThreatened',
        header: strings.THREATENED,
        Cell: ({ cell }) => (cell.getValue() ? strings.YES : strings.NO),
        editVariant: 'select',
        editSelectOptions: [
          { label: strings.YES, value: 'true' },
          { label: strings.NO, value: 'false' },
        ],
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
            const value = event.target.value === 'true';
            const uploadPayload: BiomassSpeciesUpdateOperationPayload = {
              type: 'BiomassSpecies',
              speciesId: row.original.speciesId,
              scientificName: row.original.scientificName,
              isThreatened: value,
            };
            const mainPayload = {
              observationId,
              plotId,
              updateObservationRequestPayload: { updates: [uploadPayload] },
            };
            void update(mainPayload);
          },
        }),
      },
    ],
    [saveValue, strings, observationId, plotId, update]
  );

  const speciesWithData = useMemo(() => {
    return species?.map((sp) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === sp.speciesId);
      return {
        ...sp,
        speciesName: foundSpecies?.scientificName || sp.scientificName || sp.speciesName,
      };
    });
  }, [species, availableSpecies]);

  const table = useMaterialReactTable({
    columns,
    data: speciesWithData || [],
    editDisplayMode: 'cell',
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableEditing: true,
    enableSorting: true,
    enableFilters: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    initialState: {
      sorting: [{ id: 'speciesName', desc: false }],
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
