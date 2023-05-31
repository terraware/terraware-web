import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import Card from 'src/components/common/Card';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';

export default function PlantsDashboard(): JSX.Element {
  const history = useHistory();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const hasObservations = false;

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
      isEmptyState={!plantingSites?.length || !hasObservations}
    >
      {hasObservations ? (
        <div>placeholder for selected planting site {selectedPlantingSite?.id}</div>
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
