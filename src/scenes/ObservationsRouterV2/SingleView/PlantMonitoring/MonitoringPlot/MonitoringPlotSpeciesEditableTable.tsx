import React, { type JSX, useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { MRT_ColumnDef, MRT_Row, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { useLocalization } from 'src/providers';
import {
  MonitoringSpeciesUpdateOperationPayload,
  UpdateCompletedObservationPlotApiArg,
  useGetObservationResultsQuery,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { ObservationSpeciesResults } from 'src/types/Observations';

import useObservationSpecies from '../useObservationSpecies';

export default function MonitoringPlotSpeciesEditableTable(): JSX.Element {
  const theme = useTheme();
  const params = useParams<{ observationId: string; monitoringPlotId: string }>();
  const { strings } = useLocalization();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
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

  const monitoringPlotSpecies = useObservationSpecies(monitoringPlot?.species ?? [], monitoringPlot?.unknownSpecies);

  const [update] = useUpdateCompletedObservationPlotMutation();
  const saveValue = useCallback(
    (fieldId: string, certainty: 'Other' | 'Unknown' | 'Known', speciesId?: number, speciesName?: string) =>
      (event: { currentTarget: { value: any }; target: { value: any } }) => {
        const value = event.currentTarget.value || event.target.value;
        if (monitoringPlot && value !== undefined && !isNaN(value)) {
          const uploadPayload: MonitoringSpeciesUpdateOperationPayload = {
            type: 'MonitoringSpecies',
            speciesId,
            certainty,
            speciesName,
            [fieldId]: Number(value),
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

  const columns = useMemo<MRT_ColumnDef<ObservationSpeciesResults>[]>(
    () => [
      {
        accessorKey: 'speciesScientificName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      ...(!results?.isAdHoc
        ? [
            {
              accessorKey: 'totalExisting',
              header: strings.PREEXISTING,
              muiEditTextFieldProps: ({ row }: { row: MRT_Row<ObservationSpeciesResults> }) => ({
                onBlur: saveValue(
                  'totalExisting',
                  row.original.certainty,
                  row.original.speciesId,
                  row.original.speciesName
                ),
              }),
            },
          ]
        : []),
      {
        accessorKey: 'totalLive',
        header: strings.LIVE_PLANTS,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('totalLive', row.original.certainty, row.original.speciesId, row.original.speciesName),
        }),
      },
      {
        accessorKey: 'totalDead',
        header: strings.DEAD_PLANTS,
        muiEditTextFieldProps: ({ row }) => ({
          onBlur: saveValue('totalDead', row.original.certainty, row.original.speciesId, row.original.speciesName),
        }),
      },
    ],
    [strings.SPECIES, strings.PREEXISTING, strings.LIVE_PLANTS, strings.DEAD_PLANTS, results?.isAdHoc, saveValue]
  );

  const table = useMaterialReactTable({
    columns,
    data: monitoringPlotSpecies,
    editDisplayMode: 'cell',
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableEditing: true,
    enableSorting: true,
    enableFilters: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    initialState: {
      sorting: [{ id: 'speciesName', desc: false }],
    },
    muiTableBodyProps: {
      sx: {
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: theme.palette.TwClrBaseGray025,
        },
      },
    },
    muiTablePaperProps: {
      elevation: 0,
    },
    muiTableBodyRowProps: {
      sx: {
        '& td': {
          borderBottom: 'none',
        },
      },
    },
  });

  return (
    <Box minHeight={'160px'} padding={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
}
