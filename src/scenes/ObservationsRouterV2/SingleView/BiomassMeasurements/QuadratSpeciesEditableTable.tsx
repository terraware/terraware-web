import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { IconButton, TextField, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import {
  BiomassSpeciesUpdateOperationPayload,
  DeleteQuadratSpeciesOperationPayload,
  QuadratSpeciesUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';

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

type QuadratSpeciesEditableTableProps = {
  editable: boolean;
  species?: SpeciesRow[];
  position?: QuadratPosition;
};

const REMOVE_BUTTON_CLASS = 'quadratSpeciesRemove';

const getRowKey = (row: SpeciesRow): string => String(row.speciesId ?? row.scientificName ?? row.speciesName ?? '');

/** Identifies a species to the API by id, or by name for "Other" species that aren't in the list. */
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
  const [optimisticValues, setOptimisticValues] = useState<Record<string, Partial<SpeciesRow>>>({});
  const [pendingRemoval, setPendingRemoval] = useState<SpeciesRow>();
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
    (row: SpeciesRow, numValue: number) => {
      if (!position) {
        return;
      }
      setOptimisticValues((prev) => ({
        ...prev,
        [getRowKey(row)]: { ...prev[getRowKey(row)], abundanceCount: numValue },
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
    (fieldId: string, row: SpeciesRow, value: string) => {
      const boolValue = value === 'true';
      setOptimisticValues((prev) => ({
        ...prev,
        [getRowKey(row)]: { ...prev[getRowKey(row)], [fieldId]: boolValue },
      }));
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
    const key = getRowKey(pendingRemoval);
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

  const speciesDetails = useCallback(
    (row: SpeciesRow) =>
      [
        ...(row.abundanceCount === undefined ? [] : [`${strings.ABUNDANCE} ${row.abundanceCount}`]),
        `${strings.INVASIVE} ${row.isInvasive ? strings.YES : strings.NO}`,
        `${strings.THREATENED} ${row.isThreatened ? strings.YES : strings.NO}`,
      ].join(strings.LIST_SEPARATOR),
    [strings]
  );

  const RemoveCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => (
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

  const IsInvasiveCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => <>{row.original.isInvasive ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const IsThreatenedCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => <>{row.original.isThreatened ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const abundanceColumns = useMemo<EditableTableColumn<SpeciesRow>[]>(
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

  const columns = useMemo<EditableTableColumn<SpeciesRow>[]>(
    () => [
      {
        id: 'speciesName',
        accessorKey: 'speciesName',
        header: strings.SPECIES,
        enableEditing: false,
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
    [strings, abundanceColumns, saveBiomassSpecies, IsInvasiveCell, IsThreatenedCell]
  );

  const speciesWithData = useMemo(() => {
    return species
      ?.filter((sp) => !removedKeys.includes(getRowKey(sp)))
      .map((sp) => {
        const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === sp.speciesId);
        const optimistic = optimisticValues[getRowKey(sp)] ?? {};
        return {
          ...sp,
          ...optimistic,
          speciesName: foundSpecies?.scientificName || sp.scientificName || sp.speciesName,
        };
      });
  }, [species, availableSpecies, optimisticValues, removedKeys]);

  const removalEnabled = editable && position !== undefined;

  return (
    <>
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
          removalEnabled
            ? {
                [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 0, transition: 'opacity 150ms' },
                [`& tr:hover .${REMOVE_BUTTON_CLASS}, & tr:focus-within .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 },
                '@media (hover: none)': { [`& .${REMOVE_BUTTON_CLASS}`]: { opacity: 1 } },
              }
            : undefined
        }
        tableOptions={
          removalEnabled
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
