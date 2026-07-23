import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { IconButton, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import {
  BiomassSpeciesUpdateOperationPayload,
  RecordedTreeUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import TreeNoteModal from 'src/scenes/ObservationsRouterV2/SingleView/BiomassMeasurements/TreeNoteModal';
import { ExistingTreePayload } from 'src/types/Observations';

type TreeRow = ExistingTreePayload & {
  speciesName?: string;
};

export default function TreesAndShrubsEditableTable(): JSX.Element {
  const theme = useTheme();
  const { species: availableSpecies } = useOrganizationSpecies();
  const params = useParams<{ observationId: string }>();
  const { strings } = useLocalization();

  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const forestType = results?.biomassMeasurements?.forestType;

  const [update] = useUpdateCompletedObservationPlotMutation();
  const [optimisticValues, setOptimisticValues] = useState<Record<number, Partial<TreeRow>>>({});

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

  const saveRecordedTree = useCallback(
    (fieldId: string, row: TreeRow, value: any, optimisticValue: any = value) => {
      if (value !== undefined) {
        setOptimisticValues((prev) => ({
          ...prev,
          [row.id]: { ...prev[row.id], [fieldId]: optimisticValue },
        }));
        const payload: RecordedTreeUpdateOperationPayload = {
          type: 'RecordedTree',
          recordedTreeId: row.id,
          [fieldId]: value,
        };
        updateObservation({ updates: [payload] });
      }
    },
    [updateObservation]
  );

  const saveBiomassSpecies = useCallback(
    (fieldId: string, row: TreeRow, value: string) => {
      const boolValue = value === 'true';
      setOptimisticValues((prev) => ({
        ...prev,
        [row.id]: { ...prev[row.id], [fieldId]: boolValue },
      }));
      const payload: BiomassSpeciesUpdateOperationPayload = {
        type: 'BiomassSpecies',
        speciesId: row.speciesId,
        scientificName: row.speciesId === undefined ? row.speciesName : undefined,
        [fieldId]: boolValue,
      };
      updateObservation({ updates: [payload] });
    },
    [updateObservation]
  );

  const TreeNumberCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => (
      <>
        {row.original.treeGrowthForm === 'Trunk'
          ? `${row.original.treeNumber}_${row.original.trunkNumber}`
          : row.original.treeNumber}
      </>
    ),
    []
  );

  const GrowthFormCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => (
      <>{row.original.treeGrowthForm === 'Trunk' ? 'Tree' : row.original.treeGrowthForm}</>
    ),
    []
  );

  const IsInvasiveCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => <>{row.original.isInvasive ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const IsThreatenedCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => <>{row.original.isThreatened ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const IsDeadCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => <>{row.original.isDead ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const CrownDiameterCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => {
      if (row.original.treeGrowthForm === 'Shrub') {
        return <>{row.original.shrubDiameter ?? ''}</>;
      }
      return <>{forestType === 'Mangrove' ? row.original.treeCrownDiameter ?? '' : ''}</>;
    },
    [forestType]
  );

  const [noteModalRow, setNoteModalRow] = useState<TreeRow | undefined>(undefined);

  const DescriptionCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => (
      <IconButton size='small' onClick={() => setNoteModalRow(row.original)}>
        <Icon name='note' style={{ fill: theme.palette.TwClrIcn }} size='medium' />
      </IconButton>
    ),
    [theme.palette.TwClrIcn]
  );

  const columns = useMemo<EditableTableColumn<TreeRow>[]>(
    () => [
      {
        id: 'treeNumber',
        accessorKey: 'treeNumber',
        header: strings.ID,
        enableEditing: false,
        Cell: TreeNumberCell,
      },
      {
        id: 'speciesName',
        accessorKey: 'speciesName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      {
        id: 'treeGrowthForm',
        accessorKey: 'treeGrowthForm',
        header: strings.GROWTH_FORM,
        enableEditing: false,
        Cell: GrowthFormCell,
      },
      {
        id: 'diameterAtBreastHeight',
        accessorKey: 'diameterAtBreastHeight',
        header: strings.DBH_CM,
        enableEditing: (row) => row.original.treeGrowthForm !== 'Shrub',
        editConfig: {
          onSave: (row, value) => saveRecordedTree('diameterAtBreastHeight', row, value),
        },
      },
      {
        id: 'pointOfMeasurement',
        accessorKey: 'pointOfMeasurement',
        header: strings.POM_M,
        enableEditing: (row) => row.original.treeGrowthForm !== 'Shrub',
        editConfig: {
          onSave: (row, value) => saveRecordedTree('pointOfMeasurement', row, value),
        },
      },
      {
        id: 'height',
        accessorKey: 'height',
        header: strings.HEIGHT_M,
        enableEditing: (row) => row.original.treeGrowthForm !== 'Shrub',
        editConfig: {
          onSave: (row, value) => saveRecordedTree('height', row, value),
        },
      },
      {
        id: 'crownDiameter',
        accessorFn: (row) => (row.treeGrowthForm === 'Shrub' ? row.shrubDiameter : row.treeCrownDiameter),
        header: strings.CROWN_DIAMETER_CM,
        Cell: CrownDiameterCell,
        enableEditing: (row) => row.original.treeGrowthForm === 'Shrub' || forestType === 'Mangrove',
        editConfig: {
          onSave: (row, value) =>
            row.treeGrowthForm === 'Shrub'
              ? saveRecordedTree('shrubDiameter', row, value)
              : saveRecordedTree('treeCrownDiameter', row, value),
        },
      },
      {
        id: 'isInvasive',
        accessorFn: (row) => (row.isInvasive ? 'true' : 'false'),
        header: strings.INVASIVE,
        Cell: IsInvasiveCell,
        editConfig: {
          editVariant: 'select',
          selectOptions: [
            { label: strings.YES, value: 'true' },
            { label: strings.NO, value: 'false' },
          ],
          onSave: (row, value) => saveBiomassSpecies('isInvasive', row, value),
        },
      },
      {
        id: 'isThreatened',
        accessorFn: (row) => (row.isThreatened ? 'true' : 'false'),
        header: strings.THREATENED,
        Cell: IsThreatenedCell,
        editConfig: {
          editVariant: 'select',
          selectOptions: [
            { label: strings.YES, value: 'true' },
            { label: strings.NO, value: 'false' },
          ],
          onSave: (row, value) => saveBiomassSpecies('isThreatened', row, value),
        },
      },
      {
        id: 'isDead',
        accessorFn: (row) => (row.isDead ? 'true' : 'false'),
        header: strings.DEAD,
        Cell: IsDeadCell,
        editConfig: {
          editVariant: 'select',
          selectOptions: [
            { label: strings.YES, value: 'true' },
            { label: strings.NO, value: 'false' },
          ],
          onSave: (row, value) => saveRecordedTree('isDead', row, value, value === 'true'),
        },
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: strings.NOTES,
        Cell: DescriptionCell,
        editConfig: {
          onSave: (row, value) => saveRecordedTree('description', row, value),
        },
      },
    ],
    [
      saveRecordedTree,
      saveBiomassSpecies,
      strings,
      forestType,
      TreeNumberCell,
      GrowthFormCell,
      CrownDiameterCell,
      IsInvasiveCell,
      IsThreatenedCell,
      IsDeadCell,
      DescriptionCell,
    ]
  );

  const treesWithData = useMemo(() => {
    return results?.biomassMeasurements?.trees?.map((tree) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === tree.speciesId);
      const optimistic = optimisticValues[tree.id] ?? {};
      return {
        ...tree,
        ...optimistic,
        speciesName: tree.speciesName || foundSpecies?.scientificName,
      };
    });
  }, [availableSpecies, results, optimisticValues]);

  return (
    <>
      {noteModalRow && (
        <TreeNoteModal
          description={noteModalRow.description ?? ''}
          onClose={() => setNoteModalRow(undefined)}
          onSave={(value) => saveRecordedTree('description', noteModalRow, value)}
        />
      )}
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={treesWithData ?? []}
        enableEditing={true}
        enableSorting={true}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        initialSorting={[{ id: 'speciesName', desc: false }]}
        sx={{ '&& .Mui-TableHeadCell-Content-Wrapper': { whiteSpace: 'nowrap' } }}
      />
    </>
  );
}
