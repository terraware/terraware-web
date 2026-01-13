import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { MRT_ColumnDef, MRT_Row, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import {
  MonitoringSpeciesUpdateOperationPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { ObservationSpeciesResults, ObservationSpeciesResultsPayload } from 'src/types/Observations';

type SpeciesEditableTableProps = {
  species?: ObservationSpeciesResults[];
  observationId: number;
  plotId: number;
  isCompleted: boolean;
  type?: string;
  unknownSpecies?: ObservationSpeciesResultsPayload;
};

export default function SpeciesEditableTable({
  species,
  observationId,
  plotId,
  isCompleted,
  type,
  unknownSpecies,
}: SpeciesEditableTableProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [update, updateResult] = useUpdateCompletedObservationPlotMutation();
  const { reload: reloadPlantingSiteData } = usePlantingSiteData();

  const unknownObservationSpeciesResult: ObservationSpeciesResults | undefined = useMemo(() => {
    if (!unknownSpecies) {
      return undefined;
    }
    return {
      ...unknownSpecies,
      speciesCommonName: strings.UNKNOWN,
      speciesScientificName: strings.UNKNOWN,
    } as ObservationSpeciesResults;
  }, [strings.UNKNOWN, unknownSpecies]);

  const speciesData: ObservationSpeciesResults[] = useMemo(() => {
    const result: ObservationSpeciesResults[] = species ? [...species] : [];
    if (unknownObservationSpeciesResult) {
      result.push(unknownObservationSpeciesResult);
    }
    return result;
  }, [species, unknownObservationSpeciesResult]);

  useEffect(() => {
    if (updateResult.isSuccess) {
      reloadPlantingSiteData();
    }
  }, [reloadPlantingSiteData, updateResult]);

  const saveValue = useCallback(
    (fieldId: string, certainty: 'Other' | 'Unknown' | 'Known', speciesId?: number, speciesName?: string) =>
      (event: { currentTarget: { value: any }; target: { value: any } }) => {
        const value = event.currentTarget.value || event.target.value;
        if (value !== undefined && !isNaN(value)) {
          const uploadPayload: MonitoringSpeciesUpdateOperationPayload = {
            type: 'MonitoringSpecies',
            speciesId,
            certainty,
            speciesName,
            [fieldId]: Number(value),
          };
          const mainPayload = {
            observationId,
            plotId,
            updateObservationRequestPayload: { updates: [uploadPayload] },
          };
          void update(mainPayload);
        }
      },
    [observationId, plotId, update]
  );

  const columns = useMemo<MRT_ColumnDef<ObservationSpeciesResults>[]>(
    () => [
      {
        accessorKey: 'speciesScientificName',
        header: strings.SPECIES,
        enableEditing: false,
      },
      ...(type !== 'adHoc'
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
    [strings, saveValue, type]
  );

  const table = useMaterialReactTable({
    columns,
    data: isCompleted ? speciesData || [] : [],
    editDisplayMode: 'cell',
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableEditing: true,
    enableSorting: true,
    enableFilters: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
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
