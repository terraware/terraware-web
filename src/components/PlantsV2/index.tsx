import { useCallback, useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { APP_PATHS } from 'src/constants';
import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { Box, Grid, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestSitePopulation, requestSiteReportedPlants } from 'src/redux/features/tracking/trackingThunks';
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
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import TotalMortalityRateCard from './components/TotalMoratlityRateCard';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import HighestAndLowestMortalityRateZonesCard from './components/HighestAndLowestMortalityRateZonesCard';
import HighestAndLowestMortalityRateSpeciesCard from './components/HighestAndLowestMortalityRateSpeciesCard';
import LiveDeadPlantsPerSpeciesCard from './components/LiveDeadPlantsPerSpeciesCard';
import PlantingDensityPerZoneCard from './components/PlantingDensityPerZoneCard';
import { getShortDate } from 'src/utils/dateFormatter';
import HectaresPlantedCard from './components/HectaresPlantedCard';
import EmptyMessage from '../common/EmptyMessage';
import { useHistory } from 'react-router-dom';
import PlantingSiteDensityCard from 'src/components/PlantsV2/components/PlantingSiteDensityCard';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import FormattedNumber from '../common/FormattedNumber';
import ObservedNumberOfSpeciesCard from 'src/components/PlantsV2/components/ObservedNumberOfSpeciesCard';

export default function PlantsDashboardV2(): JSX.Element {
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState(-1);
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const locale = useLocalization();
  const history = useHistory();

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSiteId(site.id), [setSelectedPlantingSiteId]);
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const defaultTimeZone = useDefaultTimeZone();
  const latestObservation = useAppSelector((state) =>
    selectLatestObservation(state, selectedPlantingSiteId, defaultTimeZone.get().id)
  );

  useEffect(() => {
    dispatch(requestObservations(org.selectedOrganization.id));
    dispatch(requestObservationsResults(org.selectedOrganization.id));
    dispatch(requestSpecies(org.selectedOrganization.id));
    dispatch(requestPlantings(org.selectedOrganization.id));
  }, [dispatch, org.selectedOrganization.id]);

  useEffect(() => {
    if (selectedPlantingSiteId !== -1) {
      dispatch(requestSitePopulation(org.selectedOrganization.id, selectedPlantingSiteId));
      dispatch(requestSiteReportedPlants(selectedPlantingSiteId));
    }
  }, [dispatch, org.selectedOrganization.id, selectedPlantingSiteId]);

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
        <TotalMortalityRateCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 3}>
        <HighestAndLowestMortalityRateZonesCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 3}>
        <HighestAndLowestMortalityRateSpeciesCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 3}>
        <LiveDeadPlantsPerSpeciesCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
    </>
  );

  const renderTotalPlantsAndSpecies = () => (
    <>
      {sectionHeader(strings.TOTAL_PLANTS_AND_SPECIES)}
      <Grid item xs={isMobile ? 12 : 4}>
        <TotalReportedPlantsCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
      {hasObservations ? (
        <Grid item xs={isMobile ? 12 : 4}>
          <ObservedNumberOfSpeciesCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      ) : (
        <Grid item xs={isMobile ? 12 : 4}>
          <PlantsReportedPerSpeciesCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
      <Grid item xs={isMobile ? 12 : 4}>
        <NumberOfSpeciesPlantedCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
    </>
  );

  const hasObservations = !!latestObservation;

  const populationResults = useAppSelector((state) => selectSitePopulationZones(state));
  const hasReportedPlants = useMemo(() => {
    const population =
      populationResults
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.flatMap((sz) => sz.populations)
        ?.filter((pop) => pop !== undefined)
        ?.reduce((acc, pop) => +pop['totalPlants(raw)'] + acc, 0) ?? 0;
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
      {sitePlantingComplete && (
        <>
          <Grid item xs={isMobile ? 12 : 4}>
            {hasObservations && <PlantingSiteDensityCard plantingSiteId={selectedPlantingSiteId} />}
          </Grid>
          <Grid item xs={isMobile ? 12 : 4}>
            <PlantingDensityPerZoneCard plantingSiteId={selectedPlantingSiteId} />
          </Grid>
        </>
      )}
      {!sitePlantingComplete && (
        <Grid item xs={isMobile ? 12 : hasObservations ? 6 : 4}>
          <PlantingSiteProgressCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
      {hasObservations && (
        <Grid item xs={isMobile ? 12 : sitePlantingComplete ? 4 : 6}>
          <HectaresPlantedCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
      {!sitePlantingComplete && (
        <Grid item xs={isMobile ? 12 : hasObservations ? 6 : 4}>
          <PlantingProgressPerZoneCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
      {!sitePlantingComplete && (
        <Grid item xs={isMobile ? 12 : hasObservations ? 6 : 4}>
          <PlantingDensityPerZoneCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      )}
    </>
  );

  const renderZoneLevelData = () => (
    <>
      {sectionHeader(strings.ZONE_LEVEL_DATA)}
      <Grid item xs={12}>
        <ZoneLevelDataMap plantingSiteId={selectedPlantingSiteId} />
      </Grid>
    </>
  );

  const hasPolygons =
    !!plantingSiteResult && !!plantingSiteResult.boundary && plantingSiteResult.boundary.coordinates?.length > 0;

  const getObservationHectares = () => {
    const numMonitoringPlots =
      latestObservation?.plantingZones.flatMap((pz) => pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots))
        ?.length ?? 0;
    const monitoringPlotHa = 0.0625;
    const totalHa = numMonitoringPlots * monitoringPlotHa;
    return totalHa;
  };

  const getDashboardSubhead = () => {
    if (selectedPlantingSiteId === -1) {
      return strings.FIRST_ADD_PLANTING_SITE;
    }
    if (latestObservation?.completedTime) {
      return strings.formatString(
        strings.DASHBOARD_HEADER_TEXT,
        <b>
          <FormattedNumber value={getObservationHectares()} />
        </b>,
        <>{getShortDate(latestObservation.completedTime, locale.activeLocale)}</>
      ) as string;
    }
  };

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      text={getDashboardSubhead()}
      onSelect={onSelect}
      pagePath={APP_PATHS.PLANTING_SITE_DASHBOARD}
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
    >
      {selectedPlantingSiteId !== -1 ? (
        <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
          {!hasObservations && renderTotalPlantsAndSpecies()}
          {hasReportedPlants && (
            <>
              {renderPlantingProgressAndDensity()}
              {hasObservations && renderMortalityRate()}
            </>
          )}
          {hasObservations && renderTotalPlantsAndSpecies()}
          {hasPolygons && renderZoneLevelData()}
        </Grid>
      ) : (
        <Box sx={{ margin: '0 auto', maxWidth: '800px', padding: '48px', width: isMobile ? 'auto' : '800px' }}>
          <EmptyMessage
            title={strings.NO_PLANTING_SITES_TITLE}
            text={strings.NO_PLANTING_SITES_DESCRIPTION}
            buttonText={strings.GO_TO_PLANTING_SITES}
            onClick={() => history.push(APP_PATHS.PLANTING_SITES)}
          />
        </Box>
      )}
    </PlantsPrimaryPage>
  );
}
