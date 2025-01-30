import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import Link from 'src/components/common/Link';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import isEnabled from 'src/features';
import { useLocalization, useOrganization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import {
  requestPlantingSitesSearchResults,
  requestSitePopulation,
  requestSiteReportedPlants,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import ObservedNumberOfSpeciesCard from 'src/scenes/PlantsDashboardRouter/components/ObservedNumberOfSpeciesCard';
import PlantingSiteDensityCard from 'src/scenes/PlantsDashboardRouter/components/PlantingSiteDensityCard';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';
import { isAfter } from 'src/utils/dateUtils';
import { isAdmin } from 'src/utils/organization';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import EmptyMessage from '../../components/common/EmptyMessage';
import FormattedNumber from '../../components/common/FormattedNumber';
import HectaresPlantedCard from './components/HectaresPlantedCard';
import HighestAndLowestMortalityRateSpeciesCard from './components/HighestAndLowestMortalityRateSpeciesCard';
import HighestAndLowestMortalityRateZonesCard from './components/HighestAndLowestMortalityRateZonesCard';
import LiveDeadPlantsPerSpeciesCard from './components/LiveDeadPlantsPerSpeciesCard';
import MortalityRateCard from './components/MortalityRateCard';
import NumberOfSpeciesPlantedCard from './components/NumberOfSpeciesPlantedCard';
import PlantingDensityCard from './components/PlantingDensityCard';
import PlantingDensityPerZoneCard from './components/PlantingDensityPerZoneCard';
import PlantingProgressPerZoneCard from './components/PlantingProgressPerZoneCard';
import PlantingSiteProgressCard from './components/PlantingSiteProgressCard';
import PlantingSiteTrendsCard from './components/PlantingSiteTrendsCard';
import PlantsAndSpeciesCard from './components/PlantsAndSpeciesCard';
import PlantsReportedPerSpeciesCard from './components/PlantsReportedPerSpeciesCard';
import TotalMortalityRateCard from './components/TotalMoratlityRateCard';
import TotalReportedPlantsCard from './components/TotalReportedPlantsCard';
import ZoneLevelDataMap from './components/ZoneLevelDataMap';

export default function PlantsDashboardView(): JSX.Element {
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState(-1);
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const locale = useLocalization();
  const navigate = useNavigate();
  const theme = useTheme();
  const newPlantsDashboardEnabled = isEnabled('New Plants Dashboard');

  const messageStyles = {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: isMobile ? 'auto' : '800px',
  };

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
    dispatch(requestPlantingSitesSearchResults(org.selectedOrganization.id));
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

  const renderMortalityRate = () =>
    newPlantsDashboardEnabled ? (
      <>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
              {strings.MORTALITY_RATE}
            </Typography>
            {hasObservations && (
              <Typography>{strings.formatString(strings.FROM_X, getLatestObservationLink())}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <MortalityRateCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      </>
    ) : (
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

  const renderTotalPlantsAndSpecies = () =>
    newPlantsDashboardEnabled ? (
      <>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
              {strings.PLANTS_AND_SPECIES_STATISTICS}
            </Typography>
            {hasObservations && (
              <Typography>{strings.formatString(strings.AS_OF_X, getLatestObservationLink())}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <PlantsAndSpeciesCard plantingSiteId={selectedPlantingSiteId} hasObservations={hasObservations} />
        </Grid>
      </>
    ) : (
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

  const hasObservationsSinceSitePlantingComplete = useMemo(() => {
    return (
      plantingSiteResult?.plantingZones
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.every((sz) => sz.plantingCompleted && isAfter(latestObservation?.completedTime, sz.plantingCompletedTime)) ??
      false
    );
  }, [plantingSiteResult, latestObservation?.completedTime]);

  const renderPlantingProgressAndDensity = () =>
    newPlantsDashboardEnabled ? (
      <>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
              {strings.PLANTING_DENSITY}
            </Typography>
            {hasObservations && (
              <Typography>{strings.formatString(strings.FROM_X, getLatestObservationLink())}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <PlantingDensityCard
            plantingSiteId={selectedPlantingSiteId}
            sitePlantingComplete={sitePlantingComplete}
            hasObservations={hasObservations}
          />
        </Grid>
      </>
    ) : (
      <>
        {sectionHeader(
          hasObservationsSinceSitePlantingComplete ? strings.PLANTING_DENSITY : strings.PLANTING_PROGRESS_AND_DENSITY
        )}
        {!hasObservations && (
          <>
            <Grid item xs={isMobile ? 12 : 4}>
              <PlantingSiteProgressCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <PlantingProgressPerZoneCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <PlantingDensityPerZoneCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
          </>
        )}
        {hasObservations && !sitePlantingComplete && (
          <>
            <Grid item xs={isMobile ? 12 : 6}>
              <PlantingSiteProgressCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
            <Grid item xs={isMobile ? 12 : 6}>
              <HectaresPlantedCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
            <Grid item xs={isMobile ? 12 : 6}>
              <PlantingProgressPerZoneCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
            <Grid item xs={isMobile ? 12 : 6}>
              <PlantingDensityPerZoneCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
          </>
        )}
        {hasObservations && sitePlantingComplete && (
          <>
            <Grid item xs={isMobile ? 12 : 4}>
              {hasObservationsSinceSitePlantingComplete ? (
                <PlantingSiteDensityCard plantingSiteId={selectedPlantingSiteId} />
              ) : (
                <PlantingSiteProgressCard plantingSiteId={selectedPlantingSiteId} />
              )}
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <PlantingDensityPerZoneCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <HectaresPlantedCard plantingSiteId={selectedPlantingSiteId} />
            </Grid>
          </>
        )}
      </>
    );

  const renderPlantingSiteTrends = () => (
    <>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
            {strings.PLANTING_SITE_TRENDS}
          </Typography>

          <Typography>{strings.ALL_OBSERVATIONS}</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <PlantingSiteTrendsCard plantingSiteId={selectedPlantingSiteId} />
      </Grid>
    </>
  );

  const renderZoneLevelData = () => (
    <>
      {newPlantsDashboardEnabled ? (
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
              {strings.PLANTING_SITE_PROGRESS}
            </Typography>
            {hasObservations && (
              <Typography>{strings.formatString(strings.AS_OF_X, getLatestObservationLink())}</Typography>
            )}
          </Box>
        </Grid>
      ) : (
        sectionHeader(strings.ZONE_LEVEL_DATA)
      )}
      <Grid item xs={12}>
        <ZoneLevelDataMap plantingSiteId={selectedPlantingSiteId} />
      </Grid>
    </>
  );

  const renderSimpleSiteMap = () => (
    <>
      {sectionHeader(strings.SITE_MAP)}
      <Grid item xs={12}>
        <Box
          sx={{
            background: theme.palette.TwClrBg,
            borderRadius: '24px',
            padding: theme.spacing(3),
            gap: theme.spacing(3),
          }}
        >
          <SimplePlantingSiteMap plantingSiteId={selectedPlantingSiteId} />
        </Box>
      </Grid>
    </>
  );

  const hasPolygons =
    !!plantingSiteResult && !!plantingSiteResult.boundary && plantingSiteResult.boundary.coordinates?.length > 0;

  const hasPlantingZones =
    !!plantingSiteResult && !!plantingSiteResult.plantingZones && plantingSiteResult.plantingZones.length > 0;

  const getObservationHectares = () => {
    const totalSquareMeters =
      latestObservation?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  };

  const getLatestObservationLink = () => {
    return latestObservation?.completedTime ? (
      <Link
        fontSize={'16px'}
        to={APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', selectedPlantingSiteId.toString()).replace(
          ':observationId',
          latestObservation.observationId.toString()
        )}
      >
        {strings.formatString(
          strings.DATE_OBSERVATION,
          DateTime.fromISO(latestObservation.completedTime).toFormat('yyyy-MM-dd')
        )}
      </Link>
    ) : (
      ''
    );
  };

  const getDashboardSubhead = () => {
    if (selectedPlantingSiteId === -1) {
      return strings.FIRST_ADD_PLANTING_SITE;
    }
    if (latestObservation?.completedTime) {
      return newPlantsDashboardEnabled
        ? (strings.formatString(
            strings.DASHBOARD_HEADER_TEXT_V2,
            <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={getObservationHectares()} />)}</b>,
            <b>{getLatestObservationLink()}</b>
          ) as string)
        : (strings.formatString(
            strings.DASHBOARD_HEADER_TEXT,
            <b>
              <FormattedNumber value={getObservationHectares()} />
            </b>,
            <>{getShortDate(latestObservation.completedTime, locale.activeLocale)}</>
          ) as string);
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
      newHeader={newPlantsDashboardEnabled}
    >
      {selectedPlantingSiteId !== -1 ? (
        <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
          {(!hasObservations || newPlantsDashboardEnabled) && renderTotalPlantsAndSpecies()}
          {newPlantsDashboardEnabled && hasObservations && renderMortalityRate()}
          {newPlantsDashboardEnabled && renderPlantingProgressAndDensity()}

          {hasReportedPlants && !newPlantsDashboardEnabled && (
            <>
              {renderPlantingProgressAndDensity()}
              {hasObservations && renderMortalityRate()}
            </>
          )}
          {hasObservations && !newPlantsDashboardEnabled && renderTotalPlantsAndSpecies()}
          {newPlantsDashboardEnabled && hasObservations && renderPlantingSiteTrends()}
          {hasPlantingZones && renderZoneLevelData()}
          {hasPolygons && !hasPlantingZones && renderSimpleSiteMap()}
        </Grid>
      ) : (
        <Box sx={{ margin: '0 auto', maxWidth: '800px', padding: '48px', width: isMobile ? 'auto' : '800px' }}>
          {isAdmin(org.selectedOrganization) ? (
            <EmptyMessage
              title={strings.NO_PLANTING_SITES_TITLE}
              text={strings.NO_PLANTING_SITES_DESCRIPTION}
              buttonText={strings.GO_TO_PLANTING_SITES}
              onClick={() => navigate(APP_PATHS.PLANTING_SITES)}
            />
          ) : (
            <EmptyMessage
              title={strings.REACH_OUT_TO_ADMIN_TITLE}
              text={strings.NO_PLANTING_SITES_CONTRIBUTOR_MSG}
              sx={messageStyles}
            />
          )}
        </Box>
      )}
    </PlantsPrimaryPage>
  );
}
