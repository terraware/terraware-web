import React, { type JSX, useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { MRT_ColumnDef, MRT_TableInstance, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  BiomassSpeciesUpdateOperationPayload,
  QuadratSpeciesUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useGetObservationResultsQuery,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';

import { QuadratPosition } from './QuadratNotesComponent';

type SpeciesRow = {
  abundancePercent?: number;
  speciesId?: number;
  speciesName?: string;
  scientificName?: string;
  isInvasive?: boolean;
  isThreatened?: boolean;
};

type QuadratSpeciesEditableTableProps = {
  editable: boolean;
  species?: SpeciesRow[];
  position: QuadratPosition;
};

export default function QuadratSpeciesEditableTable({
  editable,
  species,
  position,
}: QuadratSpeciesEditableTableProps): JSX.Element {
  const { species: availableSpecies } = useSpeciesData();
  const theme = useTheme();
  const { strings } = useLocalization();

  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const [update] = useUpdateCompletedObservationPlotMutation();

  const updateObservation = useCallback(
    (updatePayload: UpdateObservationRequestPayload) => {
      if (results?.adHocPlot) {
        const payload = {
          observationId,
          plotId: results.adHocPlot.monitoringPlotId,
          updateObservationRequestPayload: updatePayload,
        };

        void update(payload);
      }
    },
    [observationId, results, update]
  );

  const saveValue = useCallback(
    (iTable: MRT_TableInstance<SpeciesRow>, speciesId?: number, scientificName?: string) =>
      (event: { currentTarget: { value: any } }) => {
        const value = event.currentTarget.value;
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 25 && (speciesId || scientificName)) {
          const uploadPayload: QuadratSpeciesUpdateOperationPayload = {
            type: 'QuadratSpecies',
            position,
            speciesId,
            scientificName: speciesId ? undefined : scientificName,
            abundance: value,
          };

          updateObservation({ updates: [uploadPayload] });
        }
      },
    [position, updateObservation]
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
        header: strings.HERBACEOUS_ABUNDANCE_SQUARE_COUNT,
        muiEditTextFieldProps: ({ row, table: iTable }) => {
          return {
            type: 'number',
            inputProps: {
              min: 0,
              max: 25,
              maxLength: 2,
            },
            onBlur: saveValue(iTable, row.original.speciesId, row.original.scientificName || row.original.speciesName),

            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
              const val = event.target.value;
              if (val.length > 2) {
                event.target.value = val.slice(0, 2);
              }
              const numVal = Number(event.target.value);
              if (numVal > 25) {
                event.target.value = '25';
              }
            },
          };
        },
      },
      {
        accessorKey: 'abundancePercentCalculated',
        header: strings.HERBACEOUS_ABUNDANCE_PERCENT,
        enableEditing: false,
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
            updateObservation({ updates: [uploadPayload] });
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
            updateObservation({ updates: [uploadPayload] });
          },
        }),
      },
    ],
    [strings, saveValue, updateObservation]
  );

  const speciesWithData = useMemo(() => {
    return species?.map((sp) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === sp.speciesId);
      return {
        ...sp,
        abundancePercentCalculated: sp.abundancePercent ? sp.abundancePercent * 4 : undefined,
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
    enableEditing: editable,
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
