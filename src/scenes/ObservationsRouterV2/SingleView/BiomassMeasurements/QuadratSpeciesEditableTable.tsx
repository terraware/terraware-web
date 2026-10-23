import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, IconButton, MenuItem, TextField, useTheme } from '@mui/material';
import { Button, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { MRT_TableInstance, createRow } from 'material-react-table';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import {
  BiomassSpeciesUpdateOperationPayload,
  CreateBiomassSpeciesOperationPayload,
  CreateQuadratSpeciesOperationPayload,
  DeleteBiomassSpeciesOperationPayload,
  DeleteQuadratSpeciesOperationPayload,
  QuadratSpeciesUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import SpeciesSearchSelect from 'src/scenes/ObservationsRouterV2/SingleView/SpeciesSearchSelect';
import { Species } from 'src/types/Species';

import BiomassEditConfirmationModal from './BiomassEditConfirmationModal';
import { QuadratPosition } from './QuadratNotesComponent';

type SpeciesRow = {
  abundanceCount?: number;
  speciesId?: number;
  speciesName?: string;
  scientificName?: string;
  isInvasive?: boolean;
  isThreatened?: boolean;
};

type TableRow = SpeciesRow & { rowKey: string };

type QuadratSpeciesEditableTableProps = {
  editable: boolean;
  species?: SpeciesRow[];
  position?: QuadratPosition;
};

const REMOVE_BUTTON_CLASS = 'quadratSpeciesRemove';

const DRAFT_ROW_ID = 'mrt-row-create';

const MAX_ABUNDANCE = 25;

type DraftSpecies = {
  id: number;
  abundanceCount?: string;
  isInvasive?: string;
  isThreatened?: string;
  species?: Species;
};

const SPECIES_SCOPED_FIELDS = ['speciesId', 'speciesName', 'scientificName'] as const;

const speciesStateOf = (edits: Partial<SpeciesRow> = {}): Partial<SpeciesRow> =>
  Object.fromEntries(SPECIES_SCOPED_FIELDS.filter((field) => edits[field] !== undefined).map((f) => [f, edits[f]]));

const getRowKey = (row: SpeciesRow): string => String(row.speciesId ?? row.scientificName ?? row.speciesName ?? '');

const speciesRef = (row: SpeciesRow): Pick<SpeciesRow, 'speciesId' | 'scientificName'> => ({
  speciesId: row.speciesId,
  scientificName: row.speciesId === undefined ? (row.scientificName ?? row.speciesName) : undefined,
});

export default function QuadratSpeciesEditableTable({
  editable,
  species,
  position,
}: QuadratSpeciesEditableTableProps): JSX.Element {
  const { findSpeciesById, species: availableSpecies } = useOrganizationSpecies();
  const { strings } = useLocalization();
  const theme = useTheme();

  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const [update] = useUpdateCompletedObservationPlotMutation();
  const [rowEdits, setRowEdits] = useState<Record<string, Partial<SpeciesRow>>>({});
  const [speciesFlags, setSpeciesFlags] = useState<Record<string, Partial<SpeciesRow>>>({});
  const [pendingRemoval, setPendingRemoval] = useState<TableRow>();
  const [pendingSpeciesChange, setPendingSpeciesChange] = useState<{ row: TableRow; species: Species }>();
  const [draft, setDraft] = useState<DraftSpecies>();
  const [savingDraftIds, setSavingDraftIds] = useState<number[]>([]);
  const draftIdRef = useRef(0);
  const [removedKeys, setRemovedKeys] = useState<string[]>([]);

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
      const queued = pendingUpdates.current
        .catch(() => undefined)
        .then(async () => !('error' in (await update(payload))));
      pendingUpdates.current = queued;
      return queued;
    },
    [observationId, results, update]
  );

  const saveAbundance = useCallback(
    (row: TableRow, numValue: number) => {
      if (!position) {
        return;
      }
      setRowEdits((prev) => ({
        ...prev,
        [row.rowKey]: { ...prev[row.rowKey], abundanceCount: numValue },
      }));
      const uploadPayload: QuadratSpeciesUpdateOperationPayload = {
        type: 'QuadratSpecies',
        position,
        speciesId: row.speciesId,
        scientificName: row.speciesId ? undefined : row.scientificName || row.speciesName,
        abundance: numValue,
      };
      void updateObservation({ updates: [uploadPayload] });
    },
    [position, updateObservation]
  );

  const saveBiomassSpecies = useCallback(
    (fieldId: string, row: TableRow, value: string) => {
      const boolValue = value === 'true';
      const key = getRowKey(row);
      setSpeciesFlags((prev) => ({ ...prev, [key]: { ...prev[key], [fieldId]: boolValue } }));
      const payload: BiomassSpeciesUpdateOperationPayload = {
        type: 'BiomassSpecies',
        speciesId: row.speciesId,
        scientificName: row.speciesId === undefined ? row.scientificName || row.speciesName : undefined,
        [fieldId]: boolValue,
      };
      void updateObservation({ updates: [payload] });
    },
    [updateObservation]
  );

  const confirmRemoval = useCallback(async () => {
    if (!pendingRemoval) {
      return;
    }
    const key = pendingRemoval.rowKey;
    setPendingRemoval(undefined);
    setRemovedKeys((previous) => [...previous, key]);
    const payload = position
      ? ({
          type: 'DeleteQuadratSpecies',
          position,
          ...speciesRef(pendingRemoval),
        } as DeleteQuadratSpeciesOperationPayload)
      : ({ type: 'DeleteBiomassSpecies', ...speciesRef(pendingRemoval) } as DeleteBiomassSpeciesOperationPayload);
    if (!(await updateObservation({ updates: [payload] }))) {
      setRemovedKeys((previous) => previous.filter((removed) => removed !== key));
    }
  }, [pendingRemoval, position, updateObservation]);

  const confirmSpeciesChange = useCallback(async () => {
    if (!pendingSpeciesChange) {
      return;
    }
    const { row, species: newSpecies } = pendingSpeciesChange;
    setPendingSpeciesChange(undefined);
    const key = row.rowKey;
    const speciesBefore = speciesStateOf(rowEdits[key]);
    setRowEdits((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        speciesId: newSpecies.id,
        speciesName: newSpecies.scientificName,
        scientificName: undefined,
      },
    }));
    const updates: UpdateObservationRequestPayload['updates'] = position
      ? [
          { type: 'DeleteQuadratSpecies', position, ...speciesRef(row) } as DeleteQuadratSpeciesOperationPayload,
          {
            type: 'CreateQuadratSpecies',
            position,
            speciesId: newSpecies.id,
            abundance: row.abundanceCount ?? 0,
          } as CreateQuadratSpeciesOperationPayload,
        ]
      : [
          { type: 'DeleteBiomassSpecies', ...speciesRef(row) } as DeleteBiomassSpeciesOperationPayload,
          {
            type: 'CreateBiomassSpecies',
            speciesId: newSpecies.id,
            isInvasive: row.isInvasive ?? false,
            isThreatened: row.isThreatened ?? false,
          } as CreateBiomassSpeciesOperationPayload,
        ];
    if (!(await updateObservation({ updates }))) {
      setRowEdits((previous) => {
        if (previous[key]?.speciesId !== newSpecies.id) {
          return previous;
        }
        const keptEdits = { ...previous[key] };
        SPECIES_SCOPED_FIELDS.forEach((field) => delete keptEdits[field]);
        return { ...previous, [key]: { ...keptEdits, ...speciesBefore } };
      });
    }
  }, [rowEdits, pendingSpeciesChange, position, updateObservation]);

  const speciesDetails = useCallback(
    (row: SpeciesRow, { includeSpeciesFlags = true } = {}) =>
      [
        ...(row.abundanceCount === undefined ? [] : [`${strings.ABUNDANCE} ${row.abundanceCount}`]),
        ...(includeSpeciesFlags
          ? [
              `${strings.INVASIVE} ${row.isInvasive ? strings.YES : strings.NO}`,
              `${strings.THREATENED} ${row.isThreatened ? strings.YES : strings.NO}`,
            ]
          : []),
      ].join(strings.LIST_SEPARATOR),
    [strings]
  );

  const RemoveCell = useCallback(
    ({ row }: { row: { id: string; original: TableRow } }) =>
      row.id === DRAFT_ROW_ID ? null : (
        <IconButton
          aria-label={strings.formatString(strings.REMOVE_SPECIES_NAMED, row.original.speciesName ?? '') as string}
          className={REMOVE_BUTTON_CLASS}
          onClick={() => setPendingRemoval(row.original)}
          size='small'
        >
          <Icon name='iconTrashCan' size='medium' style={{ fill: theme.palette.TwClrIcn }} />
        </IconButton>
      ),
    [strings, theme.palette.TwClrIcn]
  );

  const speciesWithData = useMemo<TableRow[] | undefined>(() => {
    return species
      ?.map((sp) => ({ ...sp, rowKey: getRowKey(sp) }))
      .filter((sp) => !removedKeys.includes(sp.rowKey))
      .map((sp) => {
        const edited = { ...sp, ...(rowEdits[sp.rowKey] ?? {}) };
        const merged = { ...edited, ...(speciesFlags[getRowKey(edited)] ?? {}) };
        return {
          ...merged,
          speciesName: findSpeciesById(merged.speciesId)?.scientificName || merged.scientificName || merged.speciesName,
        };
      });
  }, [species, findSpeciesById, rowEdits, speciesFlags, removedKeys]);

  const recordedSpeciesIds = useMemo(
    () =>
      (speciesWithData ?? [])
        .map((row) => row.speciesId ?? availableSpecies.find((sp) => sp.scientificName === row.speciesName)?.id)
        .filter((id): id is number => id !== undefined),
    [availableSpecies, speciesWithData]
  );

  const canManageSpecies = editable;

  const updateDraft = useCallback(
    (changes: Partial<DraftSpecies>) => setDraft((previous) => previous && { ...previous, ...changes }),
    []
  );

  const isDraftValid = useMemo(() => {
    if (!draft?.species) {
      return false;
    }
    if (!position) {
      return draft.isInvasive !== undefined && draft.isThreatened !== undefined;
    }
    if (draft.abundanceCount === undefined || draft.abundanceCount.trim() === '') {
      return false;
    }
    const abundance = Number(draft.abundanceCount);
    return Number.isInteger(abundance) && abundance >= 0 && abundance <= MAX_ABUNDANCE;
  }, [draft, position]);

  const startAdding = useCallback((table: MRT_TableInstance<TableRow>) => {
    draftIdRef.current += 1;
    setDraft({ id: draftIdRef.current });
    table.setCreatingRow(createRow(table));
  }, []);

  const cancelAdding = useCallback((table: MRT_TableInstance<TableRow>) => {
    draftIdRef.current += 1;
    setDraft(undefined);
    table.setCreatingRow(null);
  }, []);

  const submitAdding = useCallback(
    (table: MRT_TableInstance<TableRow>) => {
      const newSpecies = draft?.species;
      if (!newSpecies || !isDraftValid || savingDraftIds.includes(draft.id)) {
        return;
      }
      const flags = {
        ...(draft.isInvasive === undefined ? {} : { isInvasive: draft.isInvasive === 'true' }),
        ...(draft.isThreatened === undefined ? {} : { isThreatened: draft.isThreatened === 'true' }),
      };
      const updates: UpdateObservationRequestPayload['updates'] = position
        ? [
            {
              type: 'CreateQuadratSpecies',
              position,
              speciesId: newSpecies.id,
              abundance: Number(draft.abundanceCount),
            } as CreateQuadratSpeciesOperationPayload,
            ...(Object.keys(flags).length === 0
              ? []
              : [
                  {
                    type: 'BiomassSpecies',
                    speciesId: newSpecies.id,
                    ...flags,
                  } as BiomassSpeciesUpdateOperationPayload,
                ]),
          ]
        : [
            {
              type: 'CreateBiomassSpecies',
              speciesId: newSpecies.id,
              isInvasive: draft.isInvasive === 'true',
              isThreatened: draft.isThreatened === 'true',
            } as CreateBiomassSpeciesOperationPayload,
          ];
      const addedKey = String(newSpecies.id);
      const addedValues: Partial<SpeciesRow> = position ? { abundanceCount: Number(draft.abundanceCount) } : {};
      const addedFlags: Partial<SpeciesRow> = position
        ? flags
        : { isInvasive: draft.isInvasive === 'true', isThreatened: draft.isThreatened === 'true' };
      const draftId = draft.id;
      void (async () => {
        setSavingDraftIds((previous) => [...previous, draftId]);
        const saved = await updateObservation({ updates });
        setSavingDraftIds((previous) => previous.filter((id) => id !== draftId));
        if (!saved) {
          return;
        }
        setRowEdits((previous) => ({ ...previous, [addedKey]: addedValues }));
        setSpeciesFlags((previous) => ({ ...previous, [addedKey]: { ...previous[addedKey], ...addedFlags } }));
        setRemovedKeys((previous) => previous.filter((key) => key !== addedKey));
        if (draftIdRef.current === draftId) {
          setDraft(undefined);
          table.setCreatingRow(null);
        }
      })();
    },
    [draft, isDraftValid, position, savingDraftIds, updateObservation]
  );

  const renderAddSpeciesActions = useCallback(
    ({ table }: { table: MRT_TableInstance<TableRow> }) =>
      draft === undefined ? (
        <Button
          icon='iconAdd'
          id='addQuadratSpecies'
          label={strings.ADD_SPECIES}
          onClick={() => startAdding(table)}
          priority='ghost'
          type='productive'
        />
      ) : (
        <Box display='flex' flex={1} gap={1} justifyContent='flex-end'>
          <Button
            id='cancelAddQuadratSpecies'
            label={strings.CANCEL}
            onClick={() => cancelAdding(table)}
            priority='secondary'
            size='medium'
            type='passive'
          />
          <Button
            disabled={!isDraftValid || savingDraftIds.includes(draft.id)}
            id='confirmAddQuadratSpecies'
            label={strings.ADD_SPECIES}
            onClick={() => submitAdding(table)}
            size='medium'
          />
        </Box>
      ),
    [cancelAdding, draft, isDraftValid, savingDraftIds, startAdding, strings.ADD_SPECIES, strings.CANCEL, submitAdding]
  );

  const rowPropsWithDropdownOnTop = useCallback(
    ({
      row,
      table,
    }: {
      row: { id: string };
      table: { getState: () => { editingCell?: { row: { id: string } } | null } };
    }) => {
      const isDraftRow = row.id === DRAFT_ROW_ID;
      return {
        hover: !isDraftRow,
        sx: {
          cursor: 'default',
          '& td': { borderBottom: 'none' },
          ...(isDraftRow || table.getState().editingCell?.row.id === row.id ? { zIndex: 3 } : {}),
        },
      };
    },
    []
  );

  const SpeciesCellEditor = useCallback(
    ({ row, table }: { row: { id: string; original: TableRow }; table: { setEditingCell: (cell: null) => void } }) =>
      row.id === DRAFT_ROW_ID ? (
        <SpeciesSearchSelect
          id='addQuadratSpecies'
          onChange={(picked) => updateDraft({ species: picked })}
          placeholder={strings.SEARCH_SPECIES}
          unavailableLabel={strings.ALREADY_IN_THIS_TABLE}
          unavailableSpeciesIds={recordedSpeciesIds}
        />
      ) : (
        <SpeciesSearchSelect
          excludedSpeciesIds={row.original.speciesId === undefined ? undefined : [row.original.speciesId]}
          id={`changeQuadratSpecies-${row.original.rowKey}`}
          onChange={(picked) => {
            if (picked) {
              setPendingSpeciesChange({ row: row.original, species: picked });
              table.setEditingCell(null);
            }
          }}
          placeholder={row.original.speciesName ?? strings.SEARCH_SPECIES}
          unavailableLabel={strings.ALREADY_IN_THIS_TABLE}
          unavailableSpeciesIds={recordedSpeciesIds}
        />
      ),
    [recordedSpeciesIds, strings.ALREADY_IN_THIS_TABLE, strings.SEARCH_SPECIES, updateDraft]
  );

  const FlagCellEditor = useCallback(
    (fieldId: 'isInvasive' | 'isThreatened') => {
      const FlagEditor = ({
        row,
        table,
      }: {
        row: { id: string; original: TableRow };
        table: { setEditingCell: (cell: null) => void };
      }) => {
        const isDraftRow = row.id === DRAFT_ROW_ID;
        return (
          <TextField
            fullWidth
            id={`${isDraftRow ? 'add' : 'edit'}QuadratSpecies-${fieldId}`}
            onChange={(event) => {
              const value = event.target.value;
              if (isDraftRow) {
                updateDraft({ [fieldId]: value });
              } else {
                saveBiomassSpecies(fieldId, row.original, value);
                table.setEditingCell(null);
              }
            }}
            select
            SelectProps={{ displayEmpty: true }}
            size='small'
            value={(isDraftRow ? draft?.[fieldId] : row.original[fieldId] ? 'true' : 'false') ?? ''}
          >
            <MenuItem disabled value=''>
              {strings.SELECT}
            </MenuItem>
            <MenuItem value='true'>{strings.YES}</MenuItem>
            <MenuItem value='false'>{strings.NO}</MenuItem>
          </TextField>
        );
      };
      return FlagEditor;
    },
    [draft, saveBiomassSpecies, strings.NO, strings.SELECT, strings.YES, updateDraft]
  );

  const invasiveEditor = useMemo(() => FlagCellEditor('isInvasive'), [FlagCellEditor]);
  const threatenedEditor = useMemo(() => FlagCellEditor('isThreatened'), [FlagCellEditor]);

  const AbundancePercentCell = useCallback(
    ({ cell, row }: { cell: { getValue: () => unknown }; row: { id: string } }) =>
      row.id === DRAFT_ROW_ID ? <>{'–'}</> : <>{(cell.getValue() as number | undefined) ?? ''}</>,
    []
  );

  const IsInvasiveCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => <>{row.original.isInvasive ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const IsThreatenedCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => <>{row.original.isThreatened ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const abundanceColumns = useMemo<EditableTableColumn<TableRow>[]>(
    () =>
      position
        ? [
            {
              id: 'abundanceCount',
              accessorKey: 'abundanceCount',
              header: strings.HERBACEOUS_ABUNDANCE_SQUARE_COUNT,
              editConfig: {
                editVariant: 'custom',
                customEditComponent: ({ row, table: iTable }) => (
                  <TextField
                    type='number'
                    defaultValue={row.original.abundanceCount ?? ''}
                    id={row.id === DRAFT_ROW_ID ? 'addQuadratSpeciesAbundance' : undefined}
                    inputProps={{ min: 0, max: MAX_ABUNDANCE }}
                    placeholder={row.id === DRAFT_ROW_ID ? '1–25' : undefined}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val.length > 2) {
                        event.target.value = val.slice(0, 2);
                      }
                      if (Number(event.target.value) > MAX_ABUNDANCE) {
                        event.target.value = String(MAX_ABUNDANCE);
                      }
                      if (row.id === DRAFT_ROW_ID) {
                        updateDraft({ abundanceCount: event.target.value });
                      }
                    }}
                    onBlur={(event) => {
                      if (row.id === DRAFT_ROW_ID) {
                        return;
                      }
                      const numValue = Number(event.target.value);
                      if (
                        !isNaN(numValue) &&
                        numValue >= 0 &&
                        numValue <= MAX_ABUNDANCE &&
                        (row.original.speciesId || row.original.scientificName || row.original.speciesName)
                      ) {
                        saveAbundance(row.original, numValue);
                      }
                      iTable.setEditingCell(null);
                    }}
                    size='small'
                    fullWidth
                  />
                ),
              },
            },
            {
              id: 'abundancePercentCalculated',
              accessorFn: (row) => (row.abundanceCount !== undefined ? row.abundanceCount * 4 : undefined),
              header: strings.HERBACEOUS_ABUNDANCE_PERCENT,
              Cell: AbundancePercentCell,
              enableEditing: false,
            },
          ]
        : [],
    [AbundancePercentCell, position, strings, saveAbundance, updateDraft]
  );

  const columns = useMemo<EditableTableColumn<TableRow>[]>(
    () => [
      {
        id: 'speciesName',
        accessorKey: 'speciesName',
        header: strings.SPECIES,
        enableEditing: canManageSpecies,
        ...(canManageSpecies ? { editConfig: { editVariant: 'custom', customEditComponent: SpeciesCellEditor } } : {}),
      },
      ...abundanceColumns,
      {
        id: 'isInvasive',
        accessorFn: (row) => (row.isInvasive ? 'true' : 'false'),
        header: strings.INVASIVE,
        Cell: IsInvasiveCell,
        editConfig: { editVariant: 'custom', customEditComponent: invasiveEditor },
      },
      {
        id: 'isThreatened',
        accessorFn: (row) => (row.isThreatened ? 'true' : 'false'),
        header: strings.THREATENED,
        Cell: IsThreatenedCell,
        editConfig: { editVariant: 'custom', customEditComponent: threatenedEditor },
      },
    ],
    [
      strings,
      abundanceColumns,
      canManageSpecies,
      invasiveEditor,
      threatenedEditor,
      SpeciesCellEditor,
      IsInvasiveCell,
      IsThreatenedCell,
    ]
  );

  return (
    <>
      {pendingSpeciesChange && (
        <BiomassEditConfirmationModal
          confirmLabel={strings.CHANGE_SPECIES}
          details={speciesDetails(pendingSpeciesChange.row, { includeSpeciesFlags: false })}
          detailsHeading={`${pendingSpeciesChange.row.speciesName ?? ''} \u2192 ${pendingSpeciesChange.species.scientificName}`}
          message={
            strings.formatString(
              strings.CHANGE_SPECIES_CONFIRMATION_MESSAGE,
              pendingSpeciesChange.row.speciesName ?? '',
              pendingSpeciesChange.species.scientificName
            ) as string
          }
          onClose={() => setPendingSpeciesChange(undefined)}
          onConfirm={() => void confirmSpeciesChange()}
          title={strings.CHANGE_SPECIES_CONFIRMATION}
        />
      )}
      {pendingRemoval && (
        <BiomassEditConfirmationModal
          confirmLabel={strings.REMOVE}
          destructive
          details={speciesDetails(pendingRemoval)}
          detailsHeading={pendingRemoval.speciesName ?? ''}
          message={strings.REMOVE_SPECIES_CONFIRMATION_MESSAGE}
          onClose={() => setPendingRemoval(undefined)}
          onConfirm={() => void confirmRemoval()}
          title={strings.formatString(strings.REMOVE_SPECIES_CONFIRMATION, pendingRemoval.speciesName ?? '') as string}
        />
      )}
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={speciesWithData ?? []}
        enableEditing={editable}
        enableSorting={true}
        enablePagination={false}
        enableTopToolbar={false}
        initialSorting={[{ id: 'speciesName', desc: false }]}
        sx={
          canManageSpecies
            ? {
                [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 0, transition: 'opacity 150ms' },
                [`& tr:hover .${REMOVE_BUTTON_CLASS}, & tr:focus-within .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 },
                '@media (hover: none)': { [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 } },
              }
            : undefined
        }
        tableOptions={
          canManageSpecies
            ? {
                createDisplayMode: 'row',
                positionCreatingRow: 'bottom',
                enableBottomToolbar: true,
                renderBottomToolbarCustomActions: renderAddSpeciesActions,
                muiTableBodyRowProps: rowPropsWithDropdownOnTop,
                enableRowActions: true,
                positionActionsColumn: 'last',
                displayColumnDefOptions: {
                  'mrt-row-actions': { Cell: RemoveCell, enableHiding: false, header: '', size: 60 },
                },
              }
            : { enableBottomToolbar: false }
        }
      />
    </>
  );
}
