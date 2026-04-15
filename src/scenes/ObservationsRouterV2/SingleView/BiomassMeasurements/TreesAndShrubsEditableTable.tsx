import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  BiomassSpeciesUpdateOperationPayload,
  RecordedTreeUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useGetObservationResultsQuery,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { ExistingTreePayload } from 'src/types/Observations';

type TreeRow = ExistingTreePayload & {
  speciesName?: string;
};

export default function TreesAndShrubsEditableTable(): JSX.Element {
  'use no memo';
  const { species: availableSpecies } = useSpeciesData();
  const params = useParams<{ observationId: string }>();
  const { strings } = useLocalization();

  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

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

  const columns = useMemo<EditableTableColumn<TreeRow>[]>(
    () => [
      {
        id: 'treeNumber',
        accessorKey: 'treeNumber',
        header: strings.ID,
        enableEditing: false,
        Cell: ({ row }) => (
          <>
            {row.original.treeGrowthForm === 'Trunk'
              ? `${row.original.treeNumber}_${row.original.trunkNumber}`
              : row.original.treeNumber}
          </>
        ),
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
        Cell: ({ row }) => <>{row.original.treeGrowthForm === 'Trunk' ? 'Tree' : row.original.treeGrowthForm}</>,
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
        id: 'shrubDiameter',
        accessorKey: 'shrubDiameter',
        header: strings.CROWN_DIAMETER_CM,
        editConfig: {
          onSave: (row, value) => saveRecordedTree('shrubDiameter', row, value),
        },
      },
      {
        id: 'isInvasive',
        accessorFn: (row) => (row.isInvasive ? 'true' : 'false'),
        header: strings.INVASIVE,
        Cell: ({ row }) => <>{row.original.isInvasive ? strings.YES : strings.NO}</>,
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
        Cell: ({ row }) => <>{row.original.isThreatened ? strings.YES : strings.NO}</>,
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
        Cell: ({ row }) => <>{row.original.isDead ? strings.YES : strings.NO}</>,
        editConfig: {
          editVariant: 'select',
          selectOptions: [
            { label: strings.YES, value: 'true' },
            { label: strings.NO, value: 'false' },
          ],
          onSave: (row, value) => saveRecordedTree('isDead', row, value, value === 'true'),
        },
      },
    ],
    [saveRecordedTree, saveBiomassSpecies, strings]
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
    />
  );
}
