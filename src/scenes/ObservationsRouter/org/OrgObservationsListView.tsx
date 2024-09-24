import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import sanitize from 'sanitize-filename';

import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { selectPlantingSiteObservations } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import { SearchService } from 'src/services';
import strings from 'src/strings';
import { Observation, ObservationPlantingZoneResults, ObservationResults } from 'src/types/Observations';
import { isAdmin } from 'src/utils/organization';

import OrgObservationsRenderer from './OrgObservationsRenderer';

const defaultColumns = (): TableColumnType[] => [
  {
    key: 'observationDate',
    name: strings.DATE,
    type: 'string',
  },
  {
    key: 'state',
    name: strings.STATUS,
    type: 'string',
  },
  {
    key: 'plantingSiteName',
    name: strings.PLANTING_SITE,
    type: 'string',
  },
  {
    key: 'plantingZones',
    name: strings.ZONES,
    type: 'string',
  },
  {
    key: 'totalPlants',
    name: strings.PLANTS,
    type: 'number',
  },
  {
    key: 'totalSpecies',
    name: strings.SPECIES,
    type: 'number',
  },
  {
    key: 'plantingDensity',
    name: strings.PLANTING_DENSITY,
    type: 'number',
  },
  {
    key: 'mortalityRate',
    name: strings.MORTALITY_RATE,
    type: 'number',
  },
  {
    key: 'endDate',
    name: strings.END_DATE,
    type: 'date',
  },
];

const scheduleObservationsColumn = (): TableColumnType[] => [
  {
    key: 'actionsMenu',
    name: '',
    type: 'string',
  },
];

export type OrgObservationsListViewProps = {
  plantingSiteId: number;
  observationsResults?: ObservationResults[];
};

export default function OrgObservationsListView({
  observationsResults,
  plantingSiteId,
}: OrgObservationsListViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const [results, setResults] = useState<any>([]);
  const theme = useTheme();
  const navigate = useNavigate();
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);

  const observations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteObservations(state, plantingSiteId)
  );

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns(), ...(scheduleObservationsEnabled ? scheduleObservationsColumn() : [])];
  }, [activeLocale, scheduleObservationsEnabled]);

  const exportObservation = useCallback(
    async (observationId: number) => {
      const observation = (observations ?? []).find((item) => item.id === observationId);

      if (observation !== undefined) {
        const csvContent = await SearchService.searchCsv({
          prefix: 'plantingSites.observations',
          fields: [
            'startDate',
            'plantingSite_name',
            'observationPlots_monitoringPlot_plantingSubzone_plantingZone_name',
            'observationPlots_monitoringPlot_plantingSubzone_name',
            'observationPlots_monitoringPlot_fullName',
            'observationPlots_monitoringPlot_southwestLatitude',
            'observationPlots_monitoringPlot_southwestLongitude',
            'observationPlots_monitoringPlot_northwestLatitude',
            'observationPlots_monitoringPlot_northwestLongitude',
            'observationPlots_monitoringPlot_southeastLatitude',
            'observationPlots_monitoringPlot_southeastLongitude',
            'observationPlots_monitoringPlot_northeastLatitude',
            'observationPlots_monitoringPlot_northeastLongitude',
          ],
          sortOrder: [{ field: 'observationPlots_monitoringPlot_id' }],
          search: {
            operation: 'field',
            type: 'Exact',
            field: 'id',
            values: [`${observationId}`],
          },
        });

        if (csvContent !== null) {
          const sanitizedSiteName = sanitize(observation.plantingSiteName);
          const fileName = `${sanitizedSiteName}-${observation.startDate}.csv`;

          const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', fileName);
          link.click();
        }
      }
    },
    [observations]
  );

  const goToRescheduleObservation = useCallback(
    (observationId: number) => {
      navigate(APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observationId.toString()));
    },
    [navigate]
  );

  const endDates = useMemo<Record<number, string>>(
    () =>
      (observations ?? []).reduce(
        (acc, observation) => {
          acc[observation.id] = observation.endDate;
          return acc;
        },
        {} as Record<number, string>
      ),
    [observations]
  );

  useEffect(() => {
    setResults(
      (observationsResults ?? []).map((observation: ObservationResults) => {
        return {
          ...observation,
          plantingZones: observation.plantingZones
            .map((zone: ObservationPlantingZoneResults) => zone.plantingZoneName)
            .join('\r'),
          endDate: endDates[observation.observationId] ?? '',
          observationDate: observation.completedDate || observation.startDate,
        };
      })
    );
  }, [endDates, observationsResults]);

  return (
    <Box>
      <Table
        id='org-observations-table'
        columns={columns}
        rows={results}
        orderBy='completedDate'
        Renderer={OrgObservationsRenderer(theme, activeLocale, goToRescheduleObservation, exportObservation)}
      />
    </Box>
  );
}
