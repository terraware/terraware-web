import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CircularProgress, Grid } from '@mui/material';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import { useAppSelector, useAppDispatch } from 'src/redux/store';
import { useLocalization, useOrganization } from 'src/providers';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { selectPlantingSiteObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import {
  selectUpcomingObservations,
  selectObservationSchedulableSites,
} from 'src/redux/features/observations/observationsUtilsSelectors';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import Card from 'src/components/common/Card';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { ButtonProps } from 'src/components/PlantsPrimaryPage/PlantsPrimaryPageView';
import ObservationsDataView from './ObservationsDataView';
import ObservationsEventsNotification from './ObservationsEventsNotification';

export type ObservationsHomeProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
};

export default function ObservationsHome(props: ObservationsHomeProps): JSX.Element {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const plantingSites = useAppSelector(selectPlantingSites);
  const observationsResults = useAppSelector((state) =>
    selectPlantingSiteObservationsResults(state, selectedPlantingSite?.id ?? -1, ['Completed', 'InProgress', 'Overdue'])
  );

  // get upcoming observations for notifications
  const upcomingObservations = useAppSelector(selectUpcomingObservations);
  // get observation schedulable sites
  const newObservationsSchedulable = useAppSelector(selectObservationSchedulableSites).length;

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

  useEffect(() => {
    dispatch(requestPlantings(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  const actionButton = useMemo<ButtonProps | undefined>(() => {
    if (!activeLocale || !newObservationsSchedulable) {
      return undefined;
    }
    return {
      title: strings.SCHEDULE_OBSERVATION,
      onClick: () => history.push(APP_PATHS.SCHEDULE_OBSERVATION),
      icon: 'plus',
    };
  }, [activeLocale, history, newObservationsSchedulable]);

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
      actionButton={actionButton}
    >
      <Grid container display='flex' flexDirection='column'>
        <ObservationsEventsNotification events={upcomingObservations} />
        {observationsResults === undefined ? (
          <CircularProgress sx={{ margin: 'auto' }} />
        ) : selectedPlantingSite && observationsResults?.length ? (
          <ObservationsDataView
            selectedPlantingSiteId={selectedPlantingSite.id}
            selectedPlantingSite={selectedPlantingSite}
            {...props}
          />
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
