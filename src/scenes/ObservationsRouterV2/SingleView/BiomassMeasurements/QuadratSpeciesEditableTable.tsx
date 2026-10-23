import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { IconButton, TextField, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import {
  BiomassSpeciesUpdateOperationPayload,
  CreateQuadratSpeciesOperationPayload,
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
  const { species: availableSpecies } = useOrganizationSpecies();
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
    if (!pendingRemoval || !position) {
      return;
    }
    const key = pendingRemoval.rowKey;
    setPendingRemoval(undefined);
    setRemovedKeys((previous) => [...previous, key]);
    const payload: DeleteQuadratSpeciesOperationPayload = {
      type: 'DeleteQuadratSpecies',
      position,
      ...speciesRef(pendingRemoval),
    };
    if (!(await updateObservation({ updates: [payload] }))) {
      setRemovedKeys((previous) => previous.filter((removed) => removed !== key));
    }
  }, [pendingRemoval, position, updateObservation]);

  const confirmSpeciesChange = useCallback(async () => {
    if (!pendingSpeciesChange || !position) {
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
    const updates = [
      { type: 'DeleteQuadratSpecies', position, ...speciesRef(row) } as DeleteQuadratSpeciesOperationPayload,
      {
        type: 'CreateQuadratSpecies',
        position,
        speciesId: newSpecies.id,
        abundance: row.abundanceCount ?? 0,
      } as CreateQuadratSpeciesOperationPayload,
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
    ({ row }: { row: { original: TableRow } }) => (
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
        const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === merged.speciesId);
        return {
          ...merged,
          speciesName: foundSpecies?.scientificName || merged.scientificName || merged.speciesName,
        };
      });
  }, [species, availableSpecies, rowEdits, speciesFlags, removedKeys]);

  const recordedSpeciesIds = useMemo(
    () =>
      (speciesWithData ?? [])
        .map((row) => row.speciesId ?? availableSpecies.find((sp) => sp.scientificName === row.speciesName)?.id)
        .filter((id): id is number => id !== undefined),
    [availableSpecies, speciesWithData]
  );

  const canManageSpecies = editable && position !== undefined;

  const SpeciesCellEditor = useCallback(
    ({ row, table }: { row: { original: TableRow }; table: { setEditingCell: (cell: null) => void } }) => (
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
    [recordedSpeciesIds, strings.ALREADY_IN_THIS_TABLE, strings.SEARCH_SPECIES]
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
                    inputProps={{ min: 0, max: 25 }}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val.length > 2) {
                        event.target.value = val.slice(0, 2);
                      }
                      if (Number(event.target.value) > 25) {
                        event.target.value = '25';
                      }
                    }}
                    onBlur={(event) => {
                      const numValue = Number(event.target.value);
                      if (
                        !isNaN(numValue) &&
                        numValue >= 0 &&
                        numValue <= 25 &&
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
              enableEditing: false,
            },
          ]
        : [],
    [position, strings, saveAbundance]
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
    ],
    [
      strings,
      abundanceColumns,
      canManageSpecies,
      saveBiomassSpecies,
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
        enableBottomToolbar={false}
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
                enableRowActions: true,
                positionActionsColumn: 'last',
                displayColumnDefOptions: {
                  'mrt-row-actions': { Cell: RemoveCell, enableHiding: false, header: '', size: 60 },
                },
              }
            : undefined
        }
      />
    </>
  );
}
