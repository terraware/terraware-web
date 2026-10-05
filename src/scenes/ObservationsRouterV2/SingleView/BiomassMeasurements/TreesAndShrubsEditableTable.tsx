import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { IconButton, useTheme } from '@mui/material';
import { Button, DialogBox, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';

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
  const { findSpeciesById } = useOrganizationSpecies();
  const params = useParams<{ observationId: string }>();
  const { strings } = useLocalization();
  const [pendingMeasurement, setPendingMeasurement] = useState<{
    fieldId: string;
    row: TreeRow;
    value: string;
    label: string;
  }>();

  const measurementRanges = useMemo<Record<string, { max: number; label: string }>>(
    () => ({
      diameterAtBreastHeight: { max: 100, label: strings.DBH_CM },
      pointOfMeasurement: { max: 2, label: strings.POM_M },
      height: { max: 45, label: strings.HEIGHT_M },
      treeCrownDiameter: { max: 1500, label: strings.CROWN_DIAMETER_CM },
      shrubDiameter: { max: 300, label: strings.CROWN_DIAMETER_CM },
    }),
    [strings]
  );

  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const forestType = results?.biomassMeasurements?.forestType;

  const [update] = useUpdateCompletedObservationPlotMutation();
  const [optimisticValues, setOptimisticValues] = useState<Record<number, Partial<TreeRow>>>({});

  const dismissMeasurementWarning = useCallback(() => {
    setPendingMeasurement(undefined);
    // Refresh table data to discard the cell value cached by the table on blur.
    setOptimisticValues((prev) => ({ ...prev }));
  }, []);

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

  const commitRecordedTree = useCallback(
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

  const saveRecordedTree = useCallback(
    (fieldId: string, row: TreeRow, value: any, optimisticValue: any = value) => {
      const range = measurementRanges[fieldId];
      if (range && Number(value) > range.max) {
        setPendingMeasurement({ fieldId, row, value: String(value), label: range.label });
        return;
      }
      commitRecordedTree(fieldId, row, value, optimisticValue);
    },
    [commitRecordedTree, measurementRanges]
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
    ({ row }: { row: { original: TreeRow } }) => {
      switch (row.original.treeGrowthForm) {
        case 'Tree':
        case 'Trunk':
          return <>{strings.TREE}</>;
        case 'Shrub':
          return <>{strings.SHRUB}</>;
      }
    },
    [strings]
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
      const optimistic = optimisticValues[tree.id] ?? {};
      return {
        ...tree,
        ...optimistic,
        speciesName: tree.speciesId
          ? findSpeciesById(tree.speciesId)?.scientificName ?? tree.speciesName
          : tree.speciesName,
      };
    });
  }, [findSpeciesById, results, optimisticValues]);

  return (
    <>
      {pendingMeasurement && (
        <DialogBox
          open={true}
          title={pendingMeasurement.label}
          size='medium'
          onClose={dismissMeasurementWarning}
          middleButtons={[
            <Button
              key='edit-value'
              id='editMeasurementValue'
              label={strings.EDIT_VALUE}
              priority='secondary'
              onClick={dismissMeasurementWarning}
            />,
            <Button
              key='keep-value'
              id='keepMeasurementValue'
              label={strings.KEEP_VALUE}
              type={'destructive'}
              onClick={() => {
                commitRecordedTree(pendingMeasurement.fieldId, pendingMeasurement.row, pendingMeasurement.value);
                setPendingMeasurement(undefined);
              }}
            />,
          ]}
        >
          {strings.formatString(
            strings.UNEXPECTED_BIOMASS_MEASUREMENT,
            pendingMeasurement.value,
            pendingMeasurement.label
          )}
        </DialogBox>
      )}
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
