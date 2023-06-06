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
import { selectPlantingSiteObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import Card from 'src/components/common/Card';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import ObservationsDataView from './ObservationsDataView';

export default function ObservationsHome(): JSX.Element {
  const history = useHistory();
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const plantingSites = useAppSelector(selectPlantingSites);
  const observationsResults = useAppSelector((state) =>
    selectPlantingSiteObservationsResults(state, selectedPlantingSite?.id)
  );

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  return (
    <PlantsPrimaryPage
      title={strings.OBSERVATIONS}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_OBSERVATIONS}
      lastVisitedPreferenceName='plants.observations.lastVisitedPlantingSite'
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      allowAllAsSiteSelection={true}
      isEmptyState={!plantingSites?.length || !observationsResults?.length}
    >
      {observationsResults === undefined ? (
        <CircularProgress sx={{ margin: 'auto' }} />
      ) : selectedPlantingSite && observationsResults?.length ? (
        <ObservationsDataView selectedPlantingSiteId={selectedPlantingSite.id} />
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
