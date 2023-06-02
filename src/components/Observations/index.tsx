import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization } from 'src/providers/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import {
  selectCompletedObservationsResults,
  selectObservationsResultsError,
} from 'src/redux/features/observations/observationsSelectors';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import Card from 'src/components/common/Card';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import ObservationsView from './ObservationsView';

export default function Observations(): JSX.Element {
  const history = useHistory();
  const { selectedOrganization } = useOrganization();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const observationsResults = useAppSelector(selectCompletedObservationsResults);
  const observationsResultsError = useAppSelector(selectObservationsResultsError);

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  const onPlantingSites = useCallback(
    (sites: PlantingSite[]) => {
      if (!sites.length) {
        history.push(APP_PATHS.HOME);
      }
      setPlantingSites(sites);
    },
    [setPlantingSites, history]
  );

  useEffect(() => {
    if (plantingSites?.length) {
      dispatch(requestObservationsResults(selectedOrganization.id));
    }
  }, [dispatch, plantingSites, selectedOrganization.id]);

  useEffect(() => {
    if (observationsResultsError) {
      snackbar.toastError();
    }
  }, [observationsResultsError, snackbar]);

  return (
    <PlantsPrimaryPage
      title={strings.OBSERVATIONS}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_OBSERVATIONS}
      lastVisitedPreferenceName='plants.observations.lastVisitedPlantingSite'
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      allowAllAsSiteSelection={true}
      onPlantingSites={onPlantingSites}
      isEmptyState={!plantingSites?.length || !observationsResults?.length}
    >
      {observationsResults === undefined && observationsResultsError === undefined ? (
        <CircularProgress sx={{ margin: 'auto' }} />
      ) : observationsResults?.length && selectedPlantingSite ? (
        <ObservationsView selectedPlantingSiteId={selectedPlantingSite.id} />
      ) : (
        <Card style={{ margin: 'auto' }}>
          <EmptyStateContent
            title={strings.OBSERVATIONS_EMPTY_STATE_TITLE}
            subtitle={[strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2]}
          />
        </Card>
      )}
    </PlantsPrimaryPage>
  );
}
