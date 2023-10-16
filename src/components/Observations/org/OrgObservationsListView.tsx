import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Box, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { useLocalization, useOrganization } from 'src/providers';
import {
  ObservationResults,
  ObservationPlantingZoneResults,
  ObservationPlantingSubzoneResults,
} from 'src/types/Observations';
import OrgObservationsRenderer from './OrgObservationsRenderer';
import isEnabled from 'src/features';
import { isAdmin } from 'src/utils/organization';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

const defaultColumns = (): TableColumnType[] => [
  {
    key: 'completedDate',
    name: strings.DATE,
    type: 'string',
  },
  {
    key: 'state',
    name: strings.STATUS,
    type: 'string',
  },
  {
    key: 'plantingZones',
    name: strings.ZONES,
    type: 'string',
  },
  {
    key: 'plantingSubzones',
    name: strings.SUBZONES,
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
];

const scheduleObservationsColumn = (): TableColumnType[] => [
  {
    key: 'actionsMenu',
    name: '',
    type: 'string',
  },
];

export type OrgObservationsListViewProps = {
  observationsResults?: ObservationResults[];
};

export default function OrgObservationsListView({ observationsResults }: OrgObservationsListViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const [results, setResults] = useState<any>([]);
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const scheduleObservationsEnabled = isEnabled('Schedule Observations') && isAdmin(selectedOrganization);

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns(), ...(scheduleObservationsEnabled ? scheduleObservationsColumn() : [])];
  }, [activeLocale, scheduleObservationsEnabled]);

  const goToRescheduleObservation = useCallback(
    (observationId: number) => {
      history.push(APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observationId.toString()));
    },
    [history]
  );

  useEffect(() => {
    setResults(
      (observationsResults ?? []).map((observation: ObservationResults) => {
        return {
          ...observation,
          plantingZones: observation.plantingZones
            .map((zone: ObservationPlantingZoneResults) => zone.plantingZoneName)
            .join('\r'),
          plantingSubzones: Array.from(
            new Set(
              observation.plantingZones.flatMap((zone: ObservationPlantingZoneResults) =>
                zone.plantingSubzones.flatMap(
                  (subzone: ObservationPlantingSubzoneResults) => subzone.plantingSubzoneName
                )
              )
            )
          ).join('\r'),
        };
      })
    );
  }, [observationsResults]);

  return (
    <Box>
      <Table
        id='org-observations-table'
        columns={columns}
        rows={results}
        orderBy='completedDate'
        Renderer={OrgObservationsRenderer(theme, classes, activeLocale, goToRescheduleObservation)}
      />
    </Box>
  );
}
