import { useCallback, useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { Grid, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestPlantingSites, requestSitePopulation } from 'src/redux/features/tracking/trackingThunks';
import { useLocalization, useOrganization } from 'src/providers';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TotalReportedPlantsCard from './components/TotalReportedPlantsCard';
import PlantsReportedPerSpeciesCard from './components/PlantsReportedPerSpeciesCard';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import NumberOfSpeciesPlantedCard from './components/NumberOfSpeciesPlantedCard';
import PlantingSiteProgressCard from './components/PlantingSiteProgressCard';
import PlantingProgressPerZoneCard from './components/PlantingProgressPerZoneCard';
import ZoneLevelDataMap from './components/ZoneLevelDataMap';
import { searchObservations } from 'src/redux/features/observations/observationsSelectors';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import TotalMortalityRateCard from './components/TotalMoratlityRateCard';
import { selectSitePopulation } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import HighestAndLowestMortalityRateZonesCard from './components/HighestAndLowestMortalityRateZonesCard';
import HighestAndLowestMortalityRateSpeciesCard from './components/HighestAndLowestMortalityRateSpeciesCard';
import LiveDeadPlantsPerSpeciesCard from './components/LiveDeadPlantsPerSpeciesCard';
import { getShortDate } from 'src/utils/dateFormatter';

export default function PlantsDashboardV2(): JSX.Element {
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const defaultTimeZone = useDefaultTimeZone();
  const dispatch = useAppDispatch();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState(-1);
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const locale = useLocalization();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSiteId(site.id), [setSelectedPlantingSiteId]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const observationsResults = useAppSelector((state) =>
    searchObservations(state, selectedPlantingSiteId, defaultTimeZone.get().id, '', [])
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
    dispatch(requestSitePopulation(org.selectedOrganization.id, selectedPlantingSiteId));
  }, [dispatch, org, selectedPlantingSiteId]);

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
        <TotalReportedPlantsCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4}>
        <PlantsReportedPerSpeciesCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4}>
        <NumberOfSpeciesPlantedCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
    </>
  );

  const hasObservations = !!latestObservation;

  const populationResults = useAppSelector((state) => selectSitePopulation(state));
  const hasReportedPlants = useMemo(() => {
    const population =
      populationResults
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.flatMap((sz) => sz.populations)
        ?.filter((pop) => pop !== undefined)
        ?.reduce((acc, pop) => +pop.totalPlants + acc, 0) ?? 0;
    return population > 0;
  }, [populationResults]);

  const plantingSiteResult = useAppSelector((state) => selectPlantingSite(state, selectedPlantingSiteId));
  const sitePlantingComplete = useMemo(() => {
    return (
      plantingSiteResult?.plantingZones
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.every((sz) => sz.plantingCompleted) ?? false
    );
  }, [plantingSiteResult]);

  const renderPlantingProgressAndDensity = () => (
    <>
      {sectionHeader(sitePlantingComplete ? strings.PLANTING_DENSITY : strings.PLANTING_PROGRESS_AND_DENSITY)}
      {!sitePlantingComplete && (
        <Grid item xs={isMobile ? 12 : hasObservations ? 6 : 4}>
          <PlantingSiteProgressCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
      {!sitePlantingComplete && (
        <Grid item xs={isMobile ? 12 : hasObservations ? 6 : 4}>
          <PlantingProgressPerZoneCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
    </>
  );

  const renderZoneLevelData = () => (
    <>
      {sectionHeader(strings.ZONE_LEVEL_DATA)}
      <Grid item xs={12}>
        <ZoneLevelDataMap plantingSiteId={selectedPlantingSiteId} observation={latestObservation} />
      </Grid>
    </>
  );

  const hasPolygons =
    !!plantingSiteResult && !!plantingSiteResult.boundary && plantingSiteResult.boundary.coordinates?.length > 0;

  const getObservationHectares = () => {
    let observationMonitoringPlots = 0;
    latestObservation?.plantingZones.forEach((pz) => {
      pz.plantingSubzones.forEach((psz) => {
        observationMonitoringPlots += psz.monitoringPlots.length;
      });
    });
    const monitoringPlotHa = 0.0625;
    const totalHa = observationMonitoringPlots * monitoringPlotHa;
    return totalHa;
  };

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      text={
        latestObservation?.completedTime
          ? (strings.formatString(
              strings.DASHBOARD_HEADER_TEXT,
              <b>{getObservationHectares()}</b>,
              <>{getShortDate(latestObservation.completedTime, locale.activeLocale)}</>
            ) as string)
          : undefined
      }
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_DASHBOARD}
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderMortalityRate()}
        {renderTotalPlantsAndSpecies()}
        {hasReportedPlants && renderPlantingProgressAndDensity()}
        {hasPolygons && renderZoneLevelData()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
