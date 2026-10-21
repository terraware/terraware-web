import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { IconButton, useTheme } from '@mui/material';
import { Button, DialogBox, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import {
  BiomassSpeciesUpdateOperationPayload,
  DeleteRecordedTreeOperationPayload,
  RecordedTreeUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import RecordedTreeConfirmationModal from 'src/scenes/ObservationsRouterV2/SingleView/BiomassMeasurements/RecordedTreeConfirmationModal';
import TreeNoteModal from 'src/scenes/ObservationsRouterV2/SingleView/BiomassMeasurements/TreeNoteModal';
import SpeciesSearchSelect from 'src/scenes/ObservationsRouterV2/SingleView/SpeciesSearchSelect';
import { ExistingTreePayload } from 'src/types/Observations';
import { Species } from 'src/types/Species';

type TreeRow = ExistingTreePayload & {
  speciesName?: string;
};

const REMOVE_BUTTON_CLASS = 'recordedTreeRemove';

/** Trunks of a multi-trunk tree are numbered within the tree, as in 5_2. */
const getTreeLabel = (row: TreeRow): string =>
  row.treeGrowthForm === 'Trunk' ? `${row.treeNumber}_${row.trunkNumber}` : String(row.treeNumber);

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
      boleHeight: { max: 45, label: strings.BOLE_HEIGHT_M },
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
  const [pendingRemoval, setPendingRemoval] = useState<TreeRow>();
  const [removedTreeIds, setRemovedTreeIds] = useState<number[]>([]);
  const [pendingSpeciesChange, setPendingSpeciesChange] = useState<{ row: TreeRow; species: Species }>();

  const dismissMeasurementWarning = useCallback(() => {
    setPendingMeasurement(undefined);
    // Refresh table data to discard the cell value cached by the table on blur.
    setOptimisticValues((prev) => ({ ...prev }));
  }, []);

  const updateObservation = useCallback(
    async (updatePayload: UpdateObservationRequestPayload): Promise<boolean> => {
      if (!results?.adHocPlot) {
        return false;
      }
      const payload = {
        observationId,
        plotId: results.adHocPlot.monitoringPlotId,
        updateObservationRequestPayload: updatePayload,
      };
      return !('error' in (await update(payload)));
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
        void updateObservation({ updates: [payload] });
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
      void updateObservation({ updates: [payload] });
    },
    [updateObservation]
  );

  const growthFormLabel = useCallback(
    (row: TreeRow) => (row.treeGrowthForm === 'Shrub' ? strings.SHRUB : strings.TREE),
    [strings.SHRUB, strings.TREE]
  );

  const treeDetails = useCallback(
    (row: TreeRow) =>
      [
        `${strings.GROWTH_FORM} ${growthFormLabel(row)}`,
        ...(row.treeGrowthForm === 'Shrub'
          ? [`${strings.CROWN_DIAMETER_CM} ${row.shrubDiameter ?? ''}`]
          : [
              `${strings.DBH_CM} ${row.diameterAtBreastHeight ?? ''}`,
              `${strings.POM_M} ${row.pointOfMeasurement ?? ''}`,
              `${strings.HEIGHT_M} ${row.height ?? ''}`,
            ]),
        `${strings.INVASIVE} ${row.isInvasive ? strings.YES : strings.NO}`,
        `${strings.THREATENED} ${row.isThreatened ? strings.YES : strings.NO}`,
        `${strings.DEAD} ${row.isDead ? strings.YES : strings.NO}`,
      ].join(strings.LIST_SEPARATOR),
    [growthFormLabel, strings]
  );

  const confirmRemoval = useCallback(async () => {
    if (!pendingRemoval) {
      return;
    }
    const { id } = pendingRemoval;
    setPendingRemoval(undefined);
    setRemovedTreeIds((previous) => [...previous, id]);
    const payload: DeleteRecordedTreeOperationPayload = { type: 'DeleteRecordedTree', recordedTreeId: id };
    if (!(await updateObservation({ updates: [payload] }))) {
      setRemovedTreeIds((previous) => previous.filter((removed) => removed !== id));
    }
  }, [pendingRemoval, updateObservation]);

  /** A change applies to the whole tree, so every trunk of it is restated and re-rendered. */
  const trunksOfTree = useCallback(
    (row: TreeRow) =>
      (results?.biomassMeasurements?.trees ?? []).filter(
        (tree) => tree.treeGrowthForm !== 'Shrub' && tree.treeNumber === row.treeNumber
      ),
    [results]
  );

  const confirmSpeciesChange = useCallback(() => {
    if (!pendingSpeciesChange) {
      return;
    }
    const { row, species } = pendingSpeciesChange;
    setPendingSpeciesChange(undefined);
    const changed = row.treeGrowthForm === 'Shrub' ? [row] : trunksOfTree(row);
    setOptimisticValues((previous) =>
      changed.reduce(
        (next, tree) => ({ ...next, [tree.id]: { ...next[tree.id], speciesId: species.id, speciesName: undefined } }),
        previous
      )
    );
    const payload: RecordedTreeUpdateOperationPayload = {
      type: 'RecordedTree',
      recordedTreeId: row.id,
      speciesId: species.id,
    };
    updateObservation({ updates: [payload] });
  }, [pendingSpeciesChange, trunksOfTree, updateObservation]);

  const SpeciesCellEditor = useCallback(
    ({ row, table }: { row: { original: TreeRow }; table: { setEditingCell: (cell: null) => void } }) => (
      <SpeciesSearchSelect
        id={`changeTreeSpecies-${row.original.id}`}
        onChange={(species) => {
          // Typing a search term is not yet a change; only a picked species asks to confirm one.
          if (species) {
            setPendingSpeciesChange({ row: row.original, species });
            table.setEditingCell(null);
          }
        }}
        placeholder={row.original.speciesName ?? strings.SEARCH_SPECIES}
      />
    ),
    [strings.SEARCH_SPECIES]
  );

  const RemoveCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => (
      <IconButton
        aria-label={strings.formatString(strings.REMOVE_SPECIES_NAMED, getTreeLabel(row.original)) as string}
        className={REMOVE_BUTTON_CLASS}
        onClick={() => setPendingRemoval(row.original)}
        size='small'
      >
        <Icon name='iconTrashCan' size='medium' style={{ fill: theme.palette.TwClrIcn }} />
      </IconButton>
    ),
    [strings, theme.palette.TwClrIcn]
  );

  const TreeNumberCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => <>{getTreeLabel(row.original)}</>,
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
      return <>{forestType === 'Mangrove' ? (row.original.treeCrownDiameter ?? '') : ''}</>;
    },
    [forestType]
  );

  const BoleHeightCell = useCallback(
    ({ row }: { row: { original: TreeRow } }) => (
      <>{row.original.treeGrowthForm !== 'Shrub' && forestType !== 'Mangrove' ? (row.original.boleHeight ?? '') : ''}</>
    ),
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
        editConfig: {
          editVariant: 'custom',
          customEditComponent: SpeciesCellEditor,
        },
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
        id: 'boleHeight',
        accessorKey: 'boleHeight',
        header: strings.BOLE_HEIGHT_M,
        Cell: BoleHeightCell,
        // Bole height is only recorded for a tree's first stem.
        enableEditing: (row) =>
          row.original.treeGrowthForm !== 'Shrub' && row.original.trunkNumber === 1 && forestType !== 'Mangrove',
        editConfig: {
          onSave: (row, value) => saveRecordedTree('boleHeight', row, value === '' ? null : value),
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
      SpeciesCellEditor,
      strings,
      forestType,
      TreeNumberCell,
      GrowthFormCell,
      CrownDiameterCell,
      BoleHeightCell,
      IsInvasiveCell,
      IsThreatenedCell,
      IsDeadCell,
      DescriptionCell,
    ]
  );

  const speciesChangeMessage = useCallback(
    (row: TreeRow, species: Species) => {
      const trunkCount = trunksOfTree(row).length;
      const treeNumber = String(row.treeNumber);
      if (row.treeGrowthForm === 'Shrub') {
        return strings.formatString(strings.CHANGE_SHRUB_SPECIES_MESSAGE, treeNumber, species.scientificName) as string;
      }
      return trunkCount > 1
        ? (strings.formatString(
            strings.CHANGE_TREE_SPECIES_MESSAGE_TRUNKS,
            treeNumber,
            species.scientificName,
            String(trunkCount)
          ) as string)
        : (strings.formatString(strings.CHANGE_TREE_SPECIES_MESSAGE, treeNumber, species.scientificName) as string);
    },
    [strings, trunksOfTree]
  );

  const rowPropsWithDropdownOnTop = useCallback(
    ({
      row,
      table,
    }: {
      row: { id: string };
      table: { getState: () => { editingCell?: { row: { id: string } } | null } };
    }) => ({
      sx: {
        cursor: 'default',
        '& td': { borderBottom: 'none' },
        ...(table.getState().editingCell?.row.id === row.id ? { zIndex: 3 } : {}),
      },
    }),
    []
  );

  const treesWithData = useMemo(() => {
    return results?.biomassMeasurements?.trees
      ?.filter((tree) => !removedTreeIds.includes(tree.id))
      .map((tree) => {
        const optimistic = optimisticValues[tree.id] ?? {};
        return {
          ...tree,
          ...optimistic,
          speciesName: tree.speciesId
            ? (findSpeciesById(tree.speciesId)?.scientificName ?? tree.speciesName)
            : tree.speciesName,
        };
      });
  }, [findSpeciesById, results, optimisticValues, removedTreeIds]);

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
      {pendingSpeciesChange && (
        <RecordedTreeConfirmationModal
          confirmLabel={strings.CHANGE_SPECIES}
          details={treeDetails(pendingSpeciesChange.row)}
          detailsHeading={`${pendingSpeciesChange.row.speciesName ?? ''} \u2192 ${pendingSpeciesChange.species.scientificName}`}
          message={speciesChangeMessage(pendingSpeciesChange.row, pendingSpeciesChange.species)}
          onClose={() => setPendingSpeciesChange(undefined)}
          onConfirm={confirmSpeciesChange}
          title={strings.CHANGE_SPECIES_CONFIRMATION}
        />
      )}
      {pendingRemoval && (
        <RecordedTreeConfirmationModal
          confirmLabel={strings.REMOVE}
          destructive
          details={treeDetails(pendingRemoval)}
          detailsHeading={pendingRemoval.speciesName ?? ''}
          message={strings.REMOVE_RECORDED_TREE_CONFIRMATION_MESSAGE}
          onClose={() => setPendingRemoval(undefined)}
          onConfirm={() => void confirmRemoval()}
          title={
            strings.formatString(
              pendingRemoval.treeGrowthForm === 'Shrub'
                ? strings.REMOVE_SHRUB_CONFIRMATION
                : strings.REMOVE_TREE_CONFIRMATION,
              getTreeLabel(pendingRemoval)
            ) as string
          }
        />
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
        enableColumnPinning={true}
        enableEditing={true}
        enableSorting={true}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        sx={{
          '&& .Mui-TableHeadCell-Content-Wrapper': { whiteSpace: 'nowrap' },
          [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 0, transition: 'opacity 150ms' },
          [`& tr:hover .${REMOVE_BUTTON_CLASS}, & tr:focus-within .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 },
          '@media (hover: none)': { [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 } },
        }}
        tableOptions={{
          muiTableBodyRowProps: rowPropsWithDropdownOnTop,
          enableRowActions: true,
          positionActionsColumn: 'last',
          displayColumnDefOptions: {
            'mrt-row-actions': { Cell: RemoveCell, enableHiding: false, header: '', size: 60 },
          },
          initialState: {
            columnPinning: { right: ['mrt-row-actions'] },
            sorting: [{ id: 'speciesName', desc: false }],
          },
        }}
      />
    </>
  );
}
