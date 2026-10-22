import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, IconButton, MenuItem, TextField, useTheme } from '@mui/material';
import { Button, DialogBox, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { MRT_TableInstance, createRow } from 'material-react-table';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import {
  BiomassSpeciesUpdateOperationPayload,
  CreateRecordedTreeOperationPayload,
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

const DRAFT_ROW_ID = 'mrt-row-create';

type DraftGrowthForm = 'Tree' | 'Shrub';

type DraftMeasurementField =
  'diameterAtBreastHeight' | 'height' | 'pointOfMeasurement' | 'shrubDiameter' | 'treeCrownDiameter';

type DraftTree = {
  id: number;
  diameterAtBreastHeight?: string;
  height?: string;
  pointOfMeasurement?: string;
  shrubDiameter?: string;
  species?: Species;
  treeCrownDiameter?: string;
  treeGrowthForm?: DraftGrowthForm;
};

const SPECIES_SCOPED_FIELDS = ['speciesId', 'speciesName', 'isInvasive', 'isThreatened'] as const;

const WHOLE_NUMBER_FIELDS: DraftMeasurementField[] = ['shrubDiameter', 'treeCrownDiameter'];

const isMeasurement = (value: string | undefined, field: DraftMeasurementField): boolean => {
  if (value === undefined || value.trim() === '' || !(Number(value) >= 0)) {
    return false;
  }
  return !WHOLE_NUMBER_FIELDS.includes(field) || Number.isInteger(Number(value));
};

const speciesStateOf = (edits: Partial<TreeRow> = {}): Partial<TreeRow> =>
  Object.fromEntries(SPECIES_SCOPED_FIELDS.filter((field) => edits[field] !== undefined).map((f) => [f, edits[f]]));

/** Trunks of a multi-trunk tree are numbered within the tree, as in 5_2. */
const getTreeLabel = (row: TreeRow): string =>
  row.treeGrowthForm === 'Trunk' ? `${row.treeNumber}_${row.trunkNumber}` : String(row.treeNumber);

export default function TreesAndShrubsEditableTable(): JSX.Element {
  const theme = useTheme();
  const { findSpeciesById } = useOrganizationSpecies();
  const params = useParams<{ observationId: string }>();
  const { strings } = useLocalization();
  const [pendingMeasurement, setPendingMeasurement] = useState<{
    keep: () => void;
    label: string;
    value: string;
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
  const [draft, setDraft] = useState<DraftTree>();
  const [savingDraftIds, setSavingDraftIds] = useState<number[]>([]);
  const draftIdRef = useRef(0);

  const updateDraft = useCallback(
    (changes: Partial<DraftTree>) => setDraft((previous) => (previous ? { ...previous, ...changes } : previous)),
    []
  );

  const dismissMeasurementWarning = useCallback(() => {
    setPendingMeasurement(undefined);
    // Refresh table data to discard the cell value cached by the table on blur.
    setOptimisticValues((prev) => ({ ...prev }));
  }, []);

  const pendingUpdates = useRef<Promise<unknown>>(Promise.resolve());

  const updateObservation = useCallback(
    (updatePayload: UpdateObservationRequestPayload): Promise<boolean> => {
      if (!results?.adHocPlot) {
        return Promise.resolve(false);
      }
      const payload = {
        observationId,
        plotId: results.adHocPlot.monitoringPlotId,
        updateObservationRequestPayload: updatePayload,
      };
      // A failed request must not strand everything queued behind it.
      const queued = pendingUpdates.current
        .catch(() => undefined)
        .then(async () => !('error' in (await update(payload))));
      pendingUpdates.current = queued;
      return queued;
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
        setPendingMeasurement({
          keep: () => commitRecordedTree(fieldId, row, value, optimisticValue),
          label: range.label,
          value: String(value),
        });
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

  const isCrownDiameterEditable = useCallback(
    (growthForm?: DraftGrowthForm) => growthForm === 'Shrub' || (growthForm === 'Tree' && forestType === 'Mangrove'),
    [forestType]
  );

  const draftFields = useMemo((): { optional: DraftMeasurementField[]; required: DraftMeasurementField[] } => {
    if (draft?.treeGrowthForm === 'Shrub') {
      return { optional: [], required: ['shrubDiameter'] };
    }
    if (draft?.treeGrowthForm === 'Tree') {
      return {
        optional: isCrownDiameterEditable('Tree') ? ['treeCrownDiameter'] : [],
        required: ['diameterAtBreastHeight', 'pointOfMeasurement', 'height'],
      };
    }
    return { optional: [], required: [] };
  }, [draft?.treeGrowthForm, isCrownDiameterEditable]);

  const isDraftValid = useMemo(() => {
    if (!draft?.species || !draft.treeGrowthForm) {
      return false;
    }
    const given = (field: DraftMeasurementField) => draft[field] !== undefined && draft[field].trim() !== '';
    return (
      draftFields.required.every((field) => isMeasurement(draft[field], field)) &&
      draftFields.optional.every((field) => !given(field) || isMeasurement(draft[field], field))
    );
  }, [draft, draftFields]);

  const startAdding = useCallback((table: MRT_TableInstance<TreeRow>) => {
    draftIdRef.current += 1;
    setDraft({ id: draftIdRef.current });
    table.setCreatingRow(createRow(table));
  }, []);

  const cancelAdding = useCallback((table: MRT_TableInstance<TreeRow>) => {
    draftIdRef.current += 1;
    setDraft(undefined);
    table.setCreatingRow(null);
  }, []);

  const submitAdding = useCallback(
    (table: MRT_TableInstance<TreeRow>) => {
      const species = draft?.species;
      if (!species || !draft?.treeGrowthForm || !isDraftValid || savingDraftIds.includes(draft.id)) {
        return;
      }
      const isShrub = draft.treeGrowthForm === 'Shrub';
      const payload: CreateRecordedTreeOperationPayload = {
        type: 'CreateRecordedTree',
        speciesId: species.id,
        treeGrowthForm: draft.treeGrowthForm,
        isDead: false,
        ...(isShrub
          ? { shrubDiameter: Number(draft.shrubDiameter) }
          : {
              diameterAtBreastHeight: Number(draft.diameterAtBreastHeight),
              height: Number(draft.height),
              pointOfMeasurement: Number(draft.pointOfMeasurement),
            }),
        ...(isCrownDiameterEditable(draft.treeGrowthForm) && !isShrub && draft.treeCrownDiameter
          ? { treeCrownDiameter: Number(draft.treeCrownDiameter) }
          : {}),
      };
      const draftId = draft.id;
      const send = async () => {
        setSavingDraftIds((previous) => [...previous, draftId]);
        const saved = await updateObservation({ updates: [payload] });
        setSavingDraftIds((previous) => previous.filter((id) => id !== draftId));
        if (saved && draftIdRef.current === draftId) {
          setDraft(undefined);
          table.setCreatingRow(null);
        }
      };

      const outlier = [...draftFields.required, ...draftFields.optional]
        .filter((field) => draft[field] !== undefined && draft[field] !== '')
        .find((field) => Number(draft[field]) > measurementRanges[field].max);
      if (outlier) {
        setPendingMeasurement({
          keep: () => void send(),
          label: measurementRanges[outlier].label,
          value: String(draft[outlier]),
        });
        return;
      }
      void send();
    },
    [draft, draftFields, isCrownDiameterEditable, isDraftValid, measurementRanges, savingDraftIds, updateObservation]
  );

  /** A change applies to the whole tree, so every trunk of it is restated and re-rendered. */
  const trunksOfTree = useCallback(
    (row: TreeRow) =>
      (results?.biomassMeasurements?.trees ?? []).filter(
        (tree) => tree.treeGrowthForm !== 'Shrub' && tree.treeNumber === row.treeNumber
      ),
    [results]
  );

  const confirmSpeciesChange = useCallback(async () => {
    if (!pendingSpeciesChange) {
      return;
    }
    const { row, species } = pendingSpeciesChange;
    setPendingSpeciesChange(undefined);
    const changed = row.treeGrowthForm === 'Shrub' ? [row] : trunksOfTree(row);
    const speciesBefore = new Map(changed.map((tree) => [tree.id, speciesStateOf(optimisticValues[tree.id])]));
    setOptimisticValues((previous) =>
      changed.reduce(
        (next, tree) => ({
          ...next,
          [tree.id]: { ...next[tree.id], speciesId: species.id, speciesName: species.scientificName },
        }),
        previous
      )
    );
    const payload: RecordedTreeUpdateOperationPayload = {
      type: 'RecordedTree',
      recordedTreeId: row.id,
      speciesId: species.id,
    };
    if (!(await updateObservation({ updates: [payload] }))) {
      setOptimisticValues((previous) =>
        changed.reduce((next, tree) => {
          if (next[tree.id]?.speciesId !== species.id) {
            return next;
          }
          const keptEdits = { ...next[tree.id] };
          SPECIES_SCOPED_FIELDS.forEach((field) => delete keptEdits[field]);
          return { ...next, [tree.id]: { ...keptEdits, ...speciesBefore.get(tree.id) } };
        }, previous)
      );
    }
  }, [optimisticValues, pendingSpeciesChange, trunksOfTree, updateObservation]);

  const SpeciesCellEditor = useCallback(
    ({ row, table }: { row: { id: string; original: TreeRow }; table: { setEditingCell: (cell: null) => void } }) =>
      row.id === DRAFT_ROW_ID ? (
        <SpeciesSearchSelect
          id='addTreeSpecies'
          onChange={(species) => updateDraft({ species })}
          placeholder={strings.SEARCH_SPECIES}
        />
      ) : (
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
    [strings.SEARCH_SPECIES, updateDraft]
  );

  const GrowthFormEditor = useCallback(
    ({ row }: { row: { id: string } }) =>
      row.id === DRAFT_ROW_ID ? (
        <TextField
          fullWidth
          id='addTreeGrowthForm'
          onChange={(event) => updateDraft({ treeGrowthForm: event.target.value as DraftGrowthForm })}
          select
          size='small'
          SelectProps={{ displayEmpty: true }}
          value={draft?.treeGrowthForm ?? ''}
        >
          <MenuItem disabled value=''>
            {strings.SELECT}
          </MenuItem>
          <MenuItem value='Tree'>{strings.TREE}</MenuItem>
          <MenuItem value='Shrub'>{strings.SHRUB}</MenuItem>
        </TextField>
      ) : (
        <></>
      ),
    [draft?.treeGrowthForm, strings.SELECT, strings.SHRUB, strings.TREE, updateDraft]
  );

  /** Only the measurements the chosen growth form uses can be filled in. */
  const renderDraftMeasurement = useCallback(
    (fieldId: DraftMeasurementField) => {
      const isShrub = draft?.treeGrowthForm === 'Shrub';
      const enabled =
        fieldId === 'treeCrownDiameter'
          ? isCrownDiameterEditable(draft?.treeGrowthForm)
          : fieldId === 'shrubDiameter'
            ? isShrub
            : draft?.treeGrowthForm === 'Tree';
      const required = enabled && fieldId !== 'treeCrownDiameter';
      return (
        <TextField
          disabled={!enabled}
          fullWidth
          id={`addTree-${fieldId}`}
          inputProps={{ min: 0 }}
          onChange={(event) => updateDraft({ [fieldId]: event.target.value })}
          placeholder={required ? strings.REQUIRED : ''}
          size='small'
          type='number'
          value={draft?.[fieldId] ?? ''}
        />
      );
    },
    [draft, isCrownDiameterEditable, strings.REQUIRED, updateDraft]
  );

  const measurementEditor = useCallback(
    (draftFieldId: DraftMeasurementField, saveFieldFor: (row: TreeRow) => string) => {
      const MeasurementEditor = ({
        cell,
        row,
        table,
      }: {
        cell: { getValue: () => unknown };
        row: { id: string; original: TreeRow };
        table: { setEditingCell: (cell: null) => void };
      }) =>
        row.id === DRAFT_ROW_ID ? (
          renderDraftMeasurement(draftFieldId)
        ) : (
          <TextField
            autoFocus
            defaultValue={(cell.getValue() as string | number | undefined) ?? ''}
            fullWidth
            onBlur={(event) => {
              saveRecordedTree(saveFieldFor(row.original), row.original, event.target.value);
              table.setEditingCell(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                (event.target as HTMLInputElement).blur();
              } else if (event.key === 'Escape') {
                table.setEditingCell(null);
              }
            }}
            size='small'
          />
        );
      return MeasurementEditor;
    },
    [renderDraftMeasurement, saveRecordedTree]
  );

  const RemoveCell = useCallback(
    ({ row }: { row: { id: string; original: TreeRow } }) =>
      row.id === DRAFT_ROW_ID ? null : (
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
    ({ row }: { row: { id: string; original: TreeRow } }) =>
      row.id === DRAFT_ROW_ID ? null : (
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
        enableEditing: (row) => row.id === DRAFT_ROW_ID,
        Cell: GrowthFormCell,
        editConfig: { editVariant: 'custom', customEditComponent: GrowthFormEditor },
      },
      {
        id: 'diameterAtBreastHeight',
        accessorKey: 'diameterAtBreastHeight',
        header: strings.DBH_CM,
        enableEditing: (row) => row.id === DRAFT_ROW_ID || row.original.treeGrowthForm !== 'Shrub',
        editConfig: {
          editVariant: 'custom',
          customEditComponent: measurementEditor('diameterAtBreastHeight', () => 'diameterAtBreastHeight'),
        },
      },
      {
        id: 'pointOfMeasurement',
        accessorKey: 'pointOfMeasurement',
        header: strings.POM_M,
        enableEditing: (row) => row.id === DRAFT_ROW_ID || row.original.treeGrowthForm !== 'Shrub',
        editConfig: {
          editVariant: 'custom',
          customEditComponent: measurementEditor('pointOfMeasurement', () => 'pointOfMeasurement'),
        },
      },
      {
        id: 'height',
        accessorKey: 'height',
        header: strings.HEIGHT_M,
        enableEditing: (row) => row.id === DRAFT_ROW_ID || row.original.treeGrowthForm !== 'Shrub',
        editConfig: {
          editVariant: 'custom',
          customEditComponent: measurementEditor('height', () => 'height'),
        },
      },
      {
        id: 'crownDiameter',
        accessorFn: (row) => (row.treeGrowthForm === 'Shrub' ? row.shrubDiameter : row.treeCrownDiameter),
        header: strings.CROWN_DIAMETER_CM,
        Cell: CrownDiameterCell,
        enableEditing: (row) =>
          row.id === DRAFT_ROW_ID || row.original.treeGrowthForm === 'Shrub' || forestType === 'Mangrove',
        editConfig: {
          editVariant: 'custom',
          customEditComponent: measurementEditor(
            draft?.treeGrowthForm === 'Shrub' ? 'shrubDiameter' : 'treeCrownDiameter',
            (row) => (row.treeGrowthForm === 'Shrub' ? 'shrubDiameter' : 'treeCrownDiameter')
          ),
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
        enableEditing: (row) => row.id !== DRAFT_ROW_ID,
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
        enableEditing: (row) => row.id !== DRAFT_ROW_ID,
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
        enableEditing: (row) => row.id !== DRAFT_ROW_ID,
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
        enableEditing: (row) => row.id !== DRAFT_ROW_ID,
        editConfig: {
          onSave: (row, value) => saveRecordedTree('description', row, value),
        },
      },
    ],
    [
      saveRecordedTree,
      saveBiomassSpecies,
      SpeciesCellEditor,
      GrowthFormEditor,
      measurementEditor,
      draft?.treeGrowthForm,
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

  const renderAddActions = useCallback(
    ({ table }: { table: MRT_TableInstance<TreeRow> }) =>
      draft === undefined ? (
        <Button
          icon='iconAdd'
          id='addTreeOrShrub'
          label={strings.ADD_TREE_OR_SHRUB}
          onClick={() => startAdding(table)}
          priority='ghost'
          type='productive'
        />
      ) : (
        <Box display='flex' flex={1} gap={1} justifyContent='flex-end'>
          <Button
            id='cancelAddTreeOrShrub'
            label={strings.CANCEL}
            onClick={() => cancelAdding(table)}
            priority='secondary'
            size='medium'
            type='passive'
          />
          <Button
            disabled={!isDraftValid || savingDraftIds.includes(draft.id)}
            id='confirmAddTreeOrShrub'
            label={strings.ADD_TREE_OR_SHRUB}
            onClick={() => submitAdding(table)}
            size='medium'
          />
        </Box>
      ),
    [
      cancelAdding,
      draft,
      isDraftValid,
      savingDraftIds,
      startAdding,
      strings.ADD_TREE_OR_SHRUB,
      strings.CANCEL,
      submitAdding,
    ]
  );

  const treesWithData = useMemo(() => {
    return results?.biomassMeasurements?.trees
      ?.filter((tree) => !removedTreeIds.includes(tree.id))
      .map((tree) => {
        const merged = { ...tree, ...(optimisticValues[tree.id] ?? {}) };
        return {
          ...merged,
          speciesName: merged.speciesId
            ? (findSpeciesById(merged.speciesId)?.scientificName ?? merged.speciesName)
            : merged.speciesName,
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
                pendingMeasurement.keep();
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
          onConfirm={() => void confirmSpeciesChange()}
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
        enableTopToolbar={false}
        sx={{
          '&& .Mui-TableHeadCell-Content-Wrapper': { whiteSpace: 'nowrap' },
          [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 0, transition: 'opacity 150ms' },
          [`& tr:hover .${REMOVE_BUTTON_CLASS}, & tr:focus-within .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 },
          '@media (hover: none)': { [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 } },
        }}
        tableOptions={{
          createDisplayMode: 'row',
          positionCreatingRow: 'bottom',
          enableBottomToolbar: true,
          renderBottomToolbarCustomActions: renderAddActions,
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
