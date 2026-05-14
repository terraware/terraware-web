import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { TextField } from '@mui/material';
import { EditableTable, EditableTableColumn } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  BiomassSpeciesUpdateOperationPayload,
  QuadratSpeciesUpdateOperationPayload,
  UpdateObservationRequestPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';

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
  position: QuadratPosition;
};

const getRowKey = (row: SpeciesRow): string => String(row.speciesId ?? row.scientificName ?? row.speciesName ?? '');

export default function QuadratSpeciesEditableTable({
  editable,
  species,
  position,
}: QuadratSpeciesEditableTableProps): JSX.Element {
  const { species: availableSpecies } = useSpeciesData();
  const { strings } = useLocalization();

  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const [update] = useUpdateCompletedObservationPlotMutation();
  const [optimisticValues, setOptimisticValues] = useState<Record<string, Partial<SpeciesRow>>>({});

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

  const saveAbundance = useCallback(
    (row: SpeciesRow, numValue: number) => {
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
      updateObservation({ updates: [uploadPayload] });
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
      updateObservation({ updates: [payload] });
    },
    [updateObservation]
  );

  const IsInvasiveCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => <>{row.original.isInvasive ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const IsThreatenedCell = useCallback(
    ({ row }: { row: { original: SpeciesRow } }) => <>{row.original.isThreatened ? strings.YES : strings.NO}</>,
    [strings.YES, strings.NO]
  );

  const columns = useMemo<EditableTableColumn<SpeciesRow>[]>(
    () => [
      {
        id: 'speciesName',
        accessorKey: 'speciesName',
        header: strings.SPECIES,
        enableEditing: false,
      },
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
    [strings, saveAbundance, saveBiomassSpecies, IsInvasiveCell, IsThreatenedCell]
  );

  const speciesWithData = useMemo(() => {
    return species?.map((sp) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === sp.speciesId);
      const optimistic = optimisticValues[getRowKey(sp)] ?? {};
      return {
        ...sp,
        ...optimistic,
        speciesName: foundSpecies?.scientificName || sp.scientificName || sp.speciesName,
      };
    });
  }, [species, availableSpecies, optimisticValues]);

  return (
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
    />
  );
}
