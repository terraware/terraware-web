import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';
import { useLocalization } from 'src/providers';
import {
  MonitoringSpeciesUpdateOperationPayload,
  UpdateCompletedObservationPlotApiArg,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { ObservationSpeciesResults } from 'src/types/Observations';

import useObservationSpecies from '../useObservationSpecies';

const getRowKey = (row: ObservationSpeciesResults): string =>
  String(row.speciesId ?? `${row.certainty}_${row.speciesName ?? ''}`);

export default function MonitoringPlotSpeciesEditableTable(): JSX.Element {
  const params = useParams<{ observationId: string; monitoringPlotId: string }>();
  const { strings } = useLocalization();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
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

  const monitoringPlotSpecies = useObservationSpecies(
    monitoringPlot?.species ?? [],
    monitoringPlot?.unknownSpecies
  ).filter((s) => (s.totalLive ?? 0) + (s.totalDead ?? 0) + (s.totalExisting ?? 0) > 0);

  const [update] = useUpdateCompletedObservationPlotMutation();
  const [optimisticValues, setOptimisticValues] = useState<Record<string, Partial<ObservationSpeciesResults>>>({});

  const saveSpeciesCount = useCallback(
    (fieldId: string, row: ObservationSpeciesResults, value: any) => {
      const numValue = Number(value);
      if (monitoringPlot && value !== undefined && !isNaN(numValue)) {
        setOptimisticValues((prev) => ({
          ...prev,
          [getRowKey(row)]: { ...prev[getRowKey(row)], [fieldId]: numValue },
        }));
        const uploadPayload: MonitoringSpeciesUpdateOperationPayload = {
          type: 'MonitoringSpecies',
          speciesId: row.speciesId,
          certainty: row.certainty,
          speciesName: row.speciesName,
          [fieldId]: numValue,
        };
        const mainPayload: UpdateCompletedObservationPlotApiArg = {
          observationId,
          plotId: monitoringPlot.monitoringPlotId,
          updateObservationRequestPayload: { updates: [uploadPayload] },
        };
        void update(mainPayload);
      }
    },
    [observationId, monitoringPlot, update]
  );

  const columns = useMemo<EditableTableColumn<ObservationSpeciesResults>[]>(
    () => [
      {
        id: 'speciesScientificName',
        accessorKey: 'speciesScientificName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      ...(!results?.isAdHoc
        ? [
            {
              id: 'totalExisting',
              accessorKey: 'totalExisting' as keyof ObservationSpeciesResults,
              header: strings.PREEXISTING,
              editConfig: {
                onSave: (row: ObservationSpeciesResults, value: any) => saveSpeciesCount('totalExisting', row, value),
              },
            } as EditableTableColumn<ObservationSpeciesResults>,
          ]
        : []),
      {
        id: 'totalLive',
        accessorKey: 'totalLive',
        header: strings.LIVE_PLANTS,
        editConfig: {
          onSave: (row, value) => saveSpeciesCount('totalLive', row, value),
        },
      },
      {
        id: 'totalDead',
        accessorKey: 'totalDead',
        header: strings.DEAD_PLANTS,
        editConfig: {
          onSave: (row, value) => saveSpeciesCount('totalDead', row, value),
        },
      },
    ],
    [strings.SPECIES, strings.PREEXISTING, strings.LIVE_PLANTS, strings.DEAD_PLANTS, results?.isAdHoc, saveSpeciesCount]
  );

  const speciesWithOptimistic = useMemo(
    () =>
      monitoringPlotSpecies.map((sp) => ({
        ...sp,
        ...optimisticValues[getRowKey(sp)],
      })),
    [monitoringPlotSpecies, optimisticValues]
  );

  return (
    <div id='monitoringPlotSpeciesTable'>
      <EditableTable
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={speciesWithOptimistic}
        enableEditing={true}
        enableSorting={true}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        initialSorting={[{ id: 'speciesScientificName', desc: false }]}
      />
    </div>
  );
}
