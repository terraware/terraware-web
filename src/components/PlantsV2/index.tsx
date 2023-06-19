import { useCallback, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { Typography } from '@mui/material';

export default function PlantsDashboardV2(): JSX.Element {
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_DASHBOARD}
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
    >
      <Typography>
        Placeholder for new plants dashboard. Selected planting site is {selectedPlantingSite?.name}.
      </Typography>
    </PlantsPrimaryPage>
  );
}
