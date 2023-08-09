import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CircularProgress, Grid } from '@mui/material';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import { useAppSelector } from 'src/redux/store';
import {
  selectPlantingSiteObservations,
  selectPlantingSiteObservationsResults,
} from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import Card from 'src/components/common/Card';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import ObservationsDataView from './ObservationsDataView';
import ObservationsEventsNotification, { ObservationEvent } from './ObservationsEventsNotification';

export type ObservationsHomeProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
};

export default function ObservationsHome(props: ObservationsHomeProps): JSX.Element {
  const history = useHistory();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const plantingSites = useAppSelector(selectPlantingSites);
  const observationsResults = useAppSelector((state) =>
    selectPlantingSiteObservationsResults(state, selectedPlantingSite?.id ?? -1, ['Completed', 'InProgress', 'Overdue'])
  );

  // get upcoming observations for notifications
  const upcomingObservations = useAppSelector((state) => selectPlantingSiteObservations(state, -1, 'Upcoming'));

  // observation events are to be displayed for empty states and data view states
  const observationsEvents = useMemo<ObservationEvent[]>(() => {
    if (!upcomingObservations) {
      return [];
    }
    const now = Date.now();
    // return observations that haven't passed
    return upcomingObservations.filter((observation) => now <= new Date(observation.endDate).getTime());
  }, [upcomingObservations]);

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  useEffect(() => {
    if (plantingSites?.length === 0) {
      history.push(APP_PATHS.HOME);
    }
  }, [history, plantingSites?.length]);

  return (
    <PlantsPrimaryPage
      title={strings.OBSERVATIONS}
      onSelect={onSelect}
      pagePath={APP_PATHS.OBSERVATIONS_SITE}
      lastVisitedPreferenceName='plants.observations.lastVisitedPlantingSite'
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      allowAllAsSiteSelection={true}
      isEmptyState={!plantingSites?.length || !observationsResults?.length}
    >
      <Grid container display='flex' flexDirection='column'>
        <ObservationsEventsNotification events={observationsEvents} />
        {observationsResults === undefined ? (
          <CircularProgress sx={{ margin: 'auto' }} />
        ) : selectedPlantingSite && observationsResults?.length ? (
          <ObservationsDataView selectedPlantingSiteId={selectedPlantingSite.id} {...props} />
        ) : (
          <Card style={{ margin: '56px auto 0', borderRadius: '24px', height: 'fit-content' }}>
            <EmptyStateContent
              title={strings.OBSERVATIONS_EMPTY_STATE_TITLE}
              subtitle={[strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2]}
            />
          </Card>
        )}
      </Grid>
    </PlantsPrimaryPage>
  );
}
