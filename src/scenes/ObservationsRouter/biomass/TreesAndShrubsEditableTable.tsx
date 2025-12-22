import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  BiomassSpeciesUpdateOperationPayload,
  RecordedTreeUpdateOperationPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { requestAdHocObservationResults } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch } from 'src/redux/store';
import { ExistingTreePayload } from 'src/types/Observations';

type TreeRow = ExistingTreePayload & {
  speciesName?: string;
};

type TreesAndShrubsEditableTableProps = {
  trees?: ExistingTreePayload[];
  observationId: number;
  plotId: number;
};

export default function TreesAndShrubsEditableTable({
  trees,
  observationId,
  plotId,
}: TreesAndShrubsEditableTableProps): JSX.Element {
  const { species: availableSpecies } = useSpeciesData();
  const theme = useTheme();
  const { strings } = useLocalization();
  const [update, updateResult] = useUpdateCompletedObservationPlotMutation();
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    if (updateResult.isSuccess && selectedOrganization) {
      void dispatch(requestAdHocObservationResults(selectedOrganization.id));
    }
  }, [updateResult, selectedOrganization, dispatch]);

  const saveValue = useCallback(
    (fieldId: string, recordedTreeId: number) => (event: { currentTarget: { value: any }; target: { value: any } }) => {
      const value = event.currentTarget.value || event.target.value;
      if (value !== undefined) {
        const uploadPayload: RecordedTreeUpdateOperationPayload = {
          type: 'RecordedTree',
          recordedTreeId,
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
    [observationId, plotId, update]
  );

  const columns = useMemo<MRT_ColumnDef<TreeRow>[]>(
    () => [
      {
        accessorKey: 'treeNumber',
        header: strings.ID,
        enableEditing: false,
        Cell: ({ row }) => {
          if (row.original.treeGrowthForm === 'Trunk') {
            return `${row.original.treeNumber}_${row.original.trunkNumber}`;
          }
          return row.original.treeNumber;
        },
      },
      {
        accessorKey: 'speciesName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      {
        accessorKey: 'treeGrowthForm',
        header: strings.GROWTH_FORM,
        enableEditing: false,
        Cell: ({ row }) => {
          return row.original.treeGrowthForm === 'Trunk' ? 'Tree' : row.original.treeGrowthForm;
        },
      },
      {
        accessorKey: 'diameterAtBreastHeight',
        header: strings.DBH_CM,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('diameterAtBreastHeight', row.original.id),
        }),
        enableEditing: (row) => row.original.treeGrowthForm !== 'Shrub',
      },
      {
        accessorKey: 'pointOfMeasurement',
        header: strings.POM_M,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('pointOfMeasurement', row.original.id),
        }),
        enableEditing: (row) => row.original.treeGrowthForm !== 'Shrub',
      },
      {
        accessorKey: 'height',
        header: strings.HEIGHT_M,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('height', row.original.id),
        }),
        enableEditing: (row) => row.original.treeGrowthForm !== 'Shrub',
      },
      {
        accessorKey: 'shrubDiameter',
        header: strings.CROWN_DIAMETER_CM,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('shrubDiameter', row.original.id),
        }),
      },
      {
        accessorKey: 'isInvasive',
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value === true || value === 'true' ? strings.YES : strings.NO;
        },
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
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value === true || value === 'true' ? strings.YES : strings.NO;
        },
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
      {
        accessorKey: 'isDead',
        header: strings.DEAD,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value === true || value === 'true' ? strings.YES : strings.NO;
        },
        editVariant: 'select',
        editSelectOptions: [
          { label: strings.YES, value: 'true' },
          { label: strings.NO, value: 'false' },
        ],
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          onBlur: saveValue('isDead', row.original.id),
        }),
      },
    ],
    [strings, saveValue, observationId, plotId, update]
  );

  const treesWithData = useMemo(() => {
    return trees?.map((tree) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === tree.speciesId);
      return {
        ...tree,
        speciesName: tree.speciesName || foundSpecies?.scientificName,
      };
    });
  }, [trees, availableSpecies]);

  const table = useMaterialReactTable({
    columns,
    data: treesWithData || [],
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
