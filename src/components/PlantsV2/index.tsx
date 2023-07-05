import { useCallback, useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { Grid, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestPlantingSites, requestSitePopulation } from 'src/redux/features/tracking/trackingThunks';
import { useOrganization } from 'src/providers';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TotalReportedPlantsCard from './components/TotalReportedPlantsCard';
import PlantsReportedPerSpeciesCard from 'src/components/PlantsV2/components/PlantsReportedPerSpeciesCard';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import NumberOfSpeciesPlantedCard from 'src/components/PlantsV2/components/NumberOfSpeciesPlantedCard';
import ZoneLevelDataMap from './components/ZoneLevelDataMap';
import { searchObservations } from 'src/redux/features/observations/observationsSelectors';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import TotalMortalityRateCard from './components/TotalMoratlityRateCard';
import HighestAndLowestMortalityRateZonesCard from './components/HighestAndLowestMortalityRateZonesCard';
import HighestAndLowestMortalityRateSpeciesCard from './components/HighestAndLowestMortalityRateSpeciesCard';
import LiveDeadPlantsPerSpeciesCard from './components/LiveDeadPlantsPerSpeciesCard';

export default function PlantsDashboardV2(): JSX.Element {
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const defaultTimeZone = useDefaultTimeZone();
  const dispatch = useAppDispatch();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const observationsResults = useAppSelector((state) =>
    searchObservations(state, selectedPlantingSite?.id ?? -1, defaultTimeZone.get().id, '', [])
  );

  const latestObservation = useMemo(() => {
    if (!observationsResults || observationsResults.length === 0) {
      return undefined;
    }
    const result = observationsResults.reduce((prev, curr) => {
      if (!prev.completedTime) {
        return curr;
      }
      if (!curr.completedTime || prev.completedTime.localeCompare(curr.completedTime) > 0) {
        return prev;
      }
      return curr;
    });
    return result.completedTime ? result : undefined;
  }, [observationsResults]);

  useEffect(() => {
    dispatch(requestPlantingSites(org.selectedOrganization.id));
    dispatch(requestObservations(org.selectedOrganization.id));
    dispatch(requestObservationsResults(org.selectedOrganization.id));
    dispatch(requestSpecies(org.selectedOrganization.id));
  }, [dispatch, org]);

  useEffect(() => {
    dispatch(requestSitePopulation(org.selectedOrganization.id, selectedPlantingSite?.id ?? -1));
  }, [dispatch, org, selectedPlantingSite]);

  const sectionHeader = (title: string) => (
    <Grid item xs={12}>
      <Typography fontSize='20px' fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  );

  const renderMortalityRate = () => (
    <>
      {sectionHeader(strings.MORTALITY_RATE)}
      <Grid item xs={isMobile ? 12 : 3}>
        <TotalMortalityRateCard observation={latestObservation} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 3}>
        <HighestAndLowestMortalityRateZonesCard observation={latestObservation} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 3}>
        <HighestAndLowestMortalityRateSpeciesCard observation={latestObservation} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 3}>
        <LiveDeadPlantsPerSpeciesCard observation={latestObservation} />
      </Grid>
    </>
  );

  const renderTotalPlantsAndSpecies = () => (
    <>
      {sectionHeader(strings.TOTAL_PLANTS_AND_SPECIES)}
      <Grid item xs={isMobile ? 12 : 4}>
        <TotalReportedPlantsCard plantingSiteId={selectedPlantingSite?.id} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4}>
        <PlantsReportedPerSpeciesCard plantingSiteId={selectedPlantingSite?.id} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4}>
        <NumberOfSpeciesPlantedCard plantingSiteId={selectedPlantingSite?.id} />
      </Grid>
    </>
  );

  const renderZoneLevelData = () => (
    <>
      {sectionHeader(strings.ZONE_LEVEL_DATA)}
      <Grid item xs={12}>
        <ZoneLevelDataMap plantingSiteId={selectedPlantingSite?.id} observation={latestObservation} />
      </Grid>
    </>
  );

  const hasPolygons =
    !!selectedPlantingSite && !!selectedPlantingSite.boundary && selectedPlantingSite.boundary.coordinates?.length > 0;

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_DASHBOARD}
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderMortalityRate()}
        {renderTotalPlantsAndSpecies()}
        {hasPolygons && renderZoneLevelData()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
