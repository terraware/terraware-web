import { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { Grid, Typography, useTheme } from '@mui/material';
import { useAppDispatch } from 'src/redux/store';
import { requestSitePopulation } from 'src/redux/features/tracking/trackingThunks';
import { useOrganization } from 'src/providers';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TotalReportedPlantsCard from './components/TotalReportedPlantsCard';

export default function PlantsDashboardV2(): JSX.Element {
  const theme = useTheme();
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  useEffect(() => {
    dispatch(requestSitePopulation(org.selectedOrganization.id, selectedPlantingSite?.id ?? -1));
    dispatch(requestObservationsResults(org.selectedOrganization.id));
  }, [dispatch, org, selectedPlantingSite]);

  const sectionHeader = (title: string) => (
    <Grid item xs={12} marginBottom={theme.spacing(3)}>
      <Typography fontSize='20px' fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  );

  const renderTotalPlantsAndSpecies = () => (
    <>
      {sectionHeader(strings.TOTAL_PLANTS_AND_SPECIES)}
      <Grid item xs={isMobile ? 12 : 4}>
        <TotalReportedPlantsCard plantingSiteId={selectedPlantingSite?.id} />
      </Grid>
    </>
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
      <Grid container>
        <Grid item xs={12}>
          {renderTotalPlantsAndSpecies()}
        </Grid>
      </Grid>
    </PlantsPrimaryPage>
  );
}
