import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, IconButton, TextField, useTheme } from '@mui/material';
import { Button, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { MRT_Row, MRT_TableInstance, createRow } from 'material-react-table';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useLocalization } from 'src/providers';
import {
  MonitoringSpeciesUpdateOperationPayload,
  UpdateCompletedObservationPlotApiArg,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { ObservationSpeciesResults } from 'src/types/Observations';
import { Species } from 'src/types/Species';

import useObservationSpecies from '../useObservationSpecies';
import ChangeSpeciesConfirmationModal from './ChangeSpeciesConfirmationModal';
import RemoveSpeciesConfirmationModal from './RemoveSpeciesConfirmationModal';
import SpeciesSearchSelect from './SpeciesSearchSelect';

/** The id material-react-table gives the row it renders for `createRow()`. */
const DRAFT_ROW_ID = 'mrt-row-create';

const REMOVE_BUTTON_CLASS = 'monitoringPlotSpeciesRemove';

type CountFieldId = 'totalExisting' | 'totalLive' | 'totalDead';

/** A species being added. Counts stay as strings so a half-typed value isn't coerced to 0. */
type DraftSpecies = {
  species?: Species;
  totalDead?: string;
  totalExisting?: string;
  totalLive?: string;
};

const getRowKey = (row: ObservationSpeciesResults): string =>
  String(row.speciesId ?? `${row.certainty}_${row.speciesName ?? ''}`);

const getCountTotal = (row: Pick<ObservationSpeciesResults, 'totalLive' | 'totalDead' | 'totalExisting'>): number =>
  (row.totalLive ?? 0) + (row.totalDead ?? 0) + (row.totalExisting ?? 0);

export default function MonitoringPlotSpeciesEditableTable(): JSX.Element {
  const params = useParams<{ observationId: string; monitoringPlotId: string }>();
  const { strings } = useLocalization();
  const theme = useTheme();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const isAdHoc = results?.isAdHoc;
  const monitoringPlot = useMemo(
    () =>
      results?.isAdHoc
        ? results?.adHocPlot
        : results?.strata
            .flatMap((stratum) => stratum.substrata)
            ?.flatMap((substratum) => substratum?.monitoringPlots)
            .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.adHocPlot, results?.isAdHoc, results?.strata]
  );

  const allMonitoringPlotSpecies = useObservationSpecies(monitoringPlot?.species ?? [], monitoringPlot?.unknownSpecies);

  const [update] = useUpdateCompletedObservationPlotMutation();
  const [optimisticValues, setOptimisticValues] = useState<Record<string, Partial<ObservationSpeciesResults>>>({});
  const [draft, setDraft] = useState<DraftSpecies>();
  const [pendingSpeciesChange, setPendingSpeciesChange] = useState<{
    row: ObservationSpeciesResults;
    species: Species;
  }>();
  const [pendingRemoval, setPendingRemoval] = useState<ObservationSpeciesResults>();

  // Optimistic values are merged before the empty rows are dropped, so zeroing a species out takes
  // it off the table right away instead of leaving a row of zeroes until the refetch lands.
  const monitoringPlotSpecies = useMemo(
    () =>
      allMonitoringPlotSpecies
        .map((species) => ({ ...species, ...optimisticValues[getRowKey(species)] }))
        .filter((species) => getCountTotal(species) > 0),
    [allMonitoringPlotSpecies, optimisticValues]
  );

  /** A species already on the table can't be added or changed to: rows are keyed by species. */
  const recordedSpeciesIds = useMemo(
    () => monitoringPlotSpecies.map((species) => species.speciesId).filter((id): id is number => id !== undefined),
    [monitoringPlotSpecies]
  );

  const clearOptimisticValues = useCallback((...keys: string[]) => {
    setOptimisticValues((previous) => {
      const next = { ...previous };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  /**
   * Sends one request per edit, but never more than one at a time.
   *
   * A count edit is fired and forgotten as the cell loses focus, so confirming a removal or a
   * species change right afterwards would otherwise race it. If the count landed last it would put
   * a value back on a species that was just zeroed out, bringing the row back on the next refetch —
   * and leaving a species change with counts against both species. Queueing keeps the API applying
   * the edits in the order they were made.
   */
  const pendingUpdates = useRef<Promise<unknown>>(Promise.resolve());

  const updateObservation = useCallback(
    (updates: MonitoringSpeciesUpdateOperationPayload[]): Promise<unknown> => {
      if (!monitoringPlot) {
        return pendingUpdates.current;
      }
      const mainPayload: UpdateCompletedObservationPlotApiArg = {
        observationId,
        plotId: monitoringPlot.monitoringPlotId,
        updateObservationRequestPayload: { updates },
      };
      // A failed request must not strand everything queued behind it.
      pendingUpdates.current = pendingUpdates.current.catch(() => undefined).then(() => update(mainPayload));
      return pendingUpdates.current;
    },
    [observationId, monitoringPlot, update]
  );

  /** Identifies an existing row to the API. Certainty plus species is how the server matches it. */
  const rowIdentity = useCallback(
    (row: ObservationSpeciesResults) => ({
      certainty: row.certainty,
      speciesId: row.speciesId,
      speciesName: row.speciesName,
    }),
    []
  );

  const saveSpeciesCount = useCallback(
    (fieldId: CountFieldId, row: ObservationSpeciesResults, value: any) => {
      const numValue = Number(value);
      if (value !== undefined && value !== '' && !isNaN(numValue) && numValue >= 0) {
        setOptimisticValues((previous) => ({
          ...previous,
          [getRowKey(row)]: { ...previous[getRowKey(row)], [fieldId]: numValue },
        }));
        void updateObservation([{ type: 'MonitoringSpecies', ...rowIdentity(row), [fieldId]: numValue }]);
      }
    },
    [rowIdentity, updateObservation]
  );

  /**
   * The API has no delete operation, so a removal zeroes the species' counts. The row then falls
   * out of the table the same way a species with nothing recorded against it does.
   */
  const confirmRemoval = useCallback(async () => {
    if (!pendingRemoval) {
      return;
    }
    const row = pendingRemoval;
    const rowKey = getRowKey(row);
    setPendingRemoval(undefined);
    setOptimisticValues((previous) => ({
      ...previous,
      [rowKey]: { ...previous[rowKey], totalExisting: 0, totalLive: 0, totalDead: 0 },
    }));
    await updateObservation([
      { type: 'MonitoringSpecies', ...rowIdentity(row), totalExisting: 0, totalLive: 0, totalDead: 0 },
    ]);
    clearOptimisticValues(rowKey);
  }, [clearOptimisticValues, pendingRemoval, rowIdentity, updateObservation]);

  /**
   * Also composed from count updates: the old species is zeroed out and the new one takes over its
   * counts. Both operations go in one request, which the server applies all-or-nothing.
   */
  const confirmSpeciesChange = useCallback(async () => {
    if (!pendingSpeciesChange) {
      return;
    }
    const { row, species } = pendingSpeciesChange;
    const rowKey = getRowKey(row);
    setPendingSpeciesChange(undefined);
    setOptimisticValues((previous) => ({
      ...previous,
      [rowKey]: { ...previous[rowKey], totalExisting: 0, totalLive: 0, totalDead: 0 },
    }));
    await updateObservation([
      { type: 'MonitoringSpecies', ...rowIdentity(row), totalExisting: 0, totalLive: 0, totalDead: 0 },
      {
        type: 'MonitoringSpecies',
        certainty: 'Known',
        speciesId: species.id,
        totalExisting: row.totalExisting,
        totalLive: row.totalLive,
        totalDead: row.totalDead,
      },
    ]);
    clearOptimisticValues(rowKey, String(species.id));
  }, [clearOptimisticValues, pendingSpeciesChange, rowIdentity, updateObservation]);

  const draftCountFields = useMemo<CountFieldId[]>(
    () => (isAdHoc ? ['totalLive', 'totalDead'] : ['totalExisting', 'totalLive', 'totalDead']),
    [isAdHoc]
  );

  // Every count is required, and a species with nothing recorded against it would not survive the
  // round trip, so at least one of them has to be above 0.
  const isDraftValid = useMemo(() => {
    if (!draft?.species) {
      return false;
    }
    const values = draftCountFields.map((fieldId) => draft[fieldId]);
    if (values.some((value) => value === undefined || value.trim() === '' || !(Number(value) >= 0))) {
      return false;
    }
    return values.some((value) => Number(value) > 0);
  }, [draft, draftCountFields]);

  const startAdding = useCallback((table: MRT_TableInstance<ObservationSpeciesResults>) => {
    setDraft({});
    table.setCreatingRow(createRow(table));
  }, []);

  const cancelAdding = useCallback((table: MRT_TableInstance<ObservationSpeciesResults>) => {
    setDraft(undefined);
    table.setCreatingRow(null);
  }, []);

  const submitAdding = useCallback(
    async (table: MRT_TableInstance<ObservationSpeciesResults>) => {
      const species = draft?.species;
      if (!species || !isDraftValid) {
        return;
      }
      setDraft(undefined);
      table.setCreatingRow(null);
      await updateObservation([
        {
          type: 'MonitoringSpecies',
          certainty: 'Known',
          speciesId: species.id,
          totalExisting: Number(draft?.totalExisting ?? 0),
          totalLive: Number(draft?.totalLive ?? 0),
          totalDead: Number(draft?.totalDead ?? 0),
        },
      ]);
      // A species removed earlier in this session still has zeroes cached against its key.
      clearOptimisticValues(String(species.id));
    },
    [clearOptimisticValues, draft, isDraftValid, updateObservation]
  );

  const SpeciesCellEditor = useCallback(
    ({
      row,
      table,
    }: {
      row: MRT_Row<ObservationSpeciesResults>;
      table: MRT_TableInstance<ObservationSpeciesResults>;
    }) =>
      row.id === DRAFT_ROW_ID ? (
        <SpeciesSearchSelect
          excludedSpeciesIds={recordedSpeciesIds}
          id='addSpeciesName'
          onChange={(species) => setDraft((previous) => ({ ...previous, species }))}
          placeholder={strings.SEARCH_SPECIES}
        />
      ) : (
        <SpeciesSearchSelect
          excludedSpeciesIds={recordedSpeciesIds}
          id={`changeSpeciesName-${getRowKey(row.original)}`}
          onChange={(species) => {
            // Typing a search term is not yet a change; only a picked species asks to confirm one.
            if (species) {
              setPendingSpeciesChange({ row: row.original, species });
              table.setEditingCell(null);
            }
          }}
          placeholder={row.original.speciesScientificName}
        />
      ),
    [recordedSpeciesIds, strings.SEARCH_SPECIES]
  );

  const countCellEditor = useCallback(
    (fieldId: CountFieldId) => {
      const CountCellEditor = ({
        cell,
        row,
        table,
      }: {
        cell: { getValue: () => any };
        row: MRT_Row<ObservationSpeciesResults>;
        table: MRT_TableInstance<ObservationSpeciesResults>;
      }) =>
        row.id === DRAFT_ROW_ID ? (
          <TextField
            fullWidth
            id={`add-${fieldId}`}
            inputProps={{ min: 0 }}
            onChange={(event) => setDraft((previous) => ({ ...previous, [fieldId]: event.target.value }))}
            placeholder={strings.REQUIRED}
            size='small'
            type='number'
            value={draft?.[fieldId] ?? ''}
          />
        ) : (
          <TextField
            autoFocus
            defaultValue={cell.getValue() ?? ''}
            fullWidth
            inputProps={{ min: 0 }}
            onBlur={(event) => {
              saveSpeciesCount(fieldId, row.original, event.target.value);
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
            type='number'
          />
        );
      return CountCellEditor;
    },
    [draft, saveSpeciesCount, strings.REQUIRED]
  );

  const RemoveCell = useCallback(
    ({ row }: { row: MRT_Row<ObservationSpeciesResults> }) =>
      row.id === DRAFT_ROW_ID ? null : (
        <IconButton
          aria-label={strings.formatString(strings.REMOVE_SPECIES_NAMED, row.original.speciesScientificName) as string}
          className={REMOVE_BUTTON_CLASS}
          onClick={() => setPendingRemoval(row.original)}
          size='small'
        >
          <Icon name='iconTrashCan' size='medium' style={{ fill: theme.palette.TwClrIcn }} />
        </IconButton>
      ),
    [strings, theme.palette.TwClrIcn]
  );

  const columns = useMemo<EditableTableColumn<ObservationSpeciesResults>[]>(
    () => [
      {
        id: 'speciesScientificName',
        accessorKey: 'speciesScientificName',
        header: strings.SPECIES,
        editConfig: {
          editVariant: 'custom',
          customEditComponent: SpeciesCellEditor,
        },
      },
      ...(!isAdHoc
        ? [
            {
              id: 'totalExisting',
              accessorKey: 'totalExisting' as keyof ObservationSpeciesResults,
              header: strings.PREEXISTING,
              editConfig: {
                editVariant: 'custom' as const,
                customEditComponent: countCellEditor('totalExisting'),
              },
            } as EditableTableColumn<ObservationSpeciesResults>,
          ]
        : []),
      {
        id: 'totalLive',
        accessorKey: 'totalLive',
        header: strings.LIVE_PLANTS,
        editConfig: {
          editVariant: 'custom',
          customEditComponent: countCellEditor('totalLive'),
        },
      },
      {
        id: 'totalDead',
        accessorKey: 'totalDead',
        header: strings.DEAD_PLANTS,
        editConfig: {
          editVariant: 'custom',
          customEditComponent: countCellEditor('totalDead'),
        },
      },
    ],
    [
      strings.SPECIES,
      strings.PREEXISTING,
      strings.LIVE_PLANTS,
      strings.DEAD_PLANTS,
      isAdHoc,
      SpeciesCellEditor,
      countCellEditor,
    ]
  );

  /** Labelled counts for the confirmation modals, e.g. "Pre-Existing 2, Live Plants 6". */
  const countsSummary = useCallback(
    (row: ObservationSpeciesResults) =>
      [
        ...(isAdHoc ? [] : [`${strings.PREEXISTING} ${row.totalExisting}`]),
        `${strings.LIVE_PLANTS} ${row.totalLive}`,
        `${strings.DEAD_PLANTS} ${row.totalDead}`,
      ].join(strings.LIST_SEPARATOR),
    [isAdHoc, strings.PREEXISTING, strings.LIVE_PLANTS, strings.DEAD_PLANTS, strings.LIST_SEPARATOR]
  );

  const renderAddSpeciesActions = useCallback(
    ({ table }: { table: MRT_TableInstance<ObservationSpeciesResults> }) =>
      draft === undefined ? (
        <Button
          icon='iconAdd'
          id='addSpecies'
          label={strings.ADD_SPECIES}
          onClick={() => startAdding(table)}
          priority='ghost'
          type='productive'
        />
      ) : (
        <Box display='flex' flex={1} gap={1} justifyContent='flex-end'>
          <Button
            id='cancelAddSpecies'
            label={strings.CANCEL}
            onClick={() => cancelAdding(table)}
            priority='secondary'
            size='medium'
            type='passive'
          />
          <Button
            disabled={!isDraftValid}
            id='confirmAddSpecies'
            label={strings.ADD_SPECIES}
            onClick={() => void submitAdding(table)}
            size='medium'
          />
        </Box>
      ),
    [cancelAdding, draft, isDraftValid, startAdding, strings.ADD_SPECIES, strings.CANCEL, submitAdding]
  );

  /**
   * Replaces EditableTable's own row props, keeping its borderless cells, and lifts the row that
   * holds an open species dropdown.
   *
   * Every body row gets `position: relative; z-index: 0` from material-react-table, which makes it
   * a stacking context: the dropdown's own z-index is then scoped inside the row, leaving it below
   * the bottom toolbar that carries the Add species actions. Raising the row past the toolbar's
   * z-index of 2 lets the dropdown paint over it.
   */
  const rowPropsWithDropdownOnTop = useCallback(
    ({
      row,
      table,
    }: {
      row: MRT_Row<ObservationSpeciesResults>;
      table: MRT_TableInstance<ObservationSpeciesResults>;
    }) => {
      const editingCell = table.getState().editingCell;
      const isDraftRow = row.id === DRAFT_ROW_ID;
      const hasOpenDropdown = isDraftRow || editingCell?.row.id === row.id;
      return {
        hover: !isDraftRow,
        sx: {
          cursor: 'default',
          '& td': { borderBottom: 'none' },
          ...(hasOpenDropdown ? { zIndex: 3 } : {}),
        },
      };
    },
    []
  );

  return (
    <div id='monitoringPlotSpeciesTable'>
      {pendingSpeciesChange && (
        <ChangeSpeciesConfirmationModal
          countsSummary={countsSummary(pendingSpeciesChange.row)}
          fromSpeciesName={pendingSpeciesChange.row.speciesScientificName}
          onClose={() => setPendingSpeciesChange(undefined)}
          onConfirm={() => void confirmSpeciesChange()}
          toSpeciesName={pendingSpeciesChange.species.scientificName}
        />
      )}
      {pendingRemoval && (
        <RemoveSpeciesConfirmationModal
          countsSummary={countsSummary(pendingRemoval)}
          onClose={() => setPendingRemoval(undefined)}
          onConfirm={() => void confirmRemoval()}
          speciesName={pendingRemoval.speciesScientificName}
        />
      )}
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={monitoringPlotSpecies}
        enableEditing={true}
        enablePagination={false}
        enableSorting={true}
        enableTopToolbar={false}
        initialSorting={[{ id: 'speciesScientificName', desc: false }]}
        sx={{
          // The remove button is revealed on hover, or kept visible where there is no hover to
          // give, so it can still be reached by tapping the row.
          [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 0, transition: 'opacity 150ms' },
          [`& tr:hover .${REMOVE_BUTTON_CLASS}, & tr:focus-within .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 },
          '@media (hover: none)': { [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 } },
        }}
        tableOptions={{
          createDisplayMode: 'row',
          // Injected after sorting, so the row being added stays at the bottom of the table.
          positionCreatingRow: 'bottom',
          enableRowActions: true,
          positionActionsColumn: 'last',
          displayColumnDefOptions: {
            'mrt-row-actions': { Cell: RemoveCell, enableHiding: false, header: '', size: 60 },
          },
          enableBottomToolbar: true,
          renderBottomToolbarCustomActions: renderAddSpeciesActions,
          muiTableBodyRowProps: rowPropsWithDropdownOnTop,
        }}
      />
    </div>
  );
}
