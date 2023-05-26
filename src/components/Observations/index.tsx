import { useCallback, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';

export default function PlantsDashboard(): JSX.Element {
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const hasObservations = false;

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  const onPlantingSites = useCallback((sites: PlantingSite[]) => setPlantingSites(sites), [setPlantingSites]);

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
      <div>placeholder for selected planting site {selectedPlantingSite?.id}</div>
    </PlantsPrimaryPage>
  );
}
