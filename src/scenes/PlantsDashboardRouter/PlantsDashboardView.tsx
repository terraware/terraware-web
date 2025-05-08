import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import Link from 'src/components/common/Link';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { useOrganization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite, selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import {
  requestPlantingSites,
  requestPlantingSitesSearchResults,
  requestSitePopulation,
  requestSiteReportedPlants,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import FormattedNumber from '../../components/common/FormattedNumber';
import MortalityRateCard from './components/MortalityRateCard';
import PlantingDensityCard from './components/PlantingDensityCard';
import PlantingSiteTrendsCard from './components/PlantingSiteTrendsCard';
import PlantsAndSpeciesCard from './components/PlantsAndSpeciesCard';
import ZoneLevelDataMap from './components/ZoneLevelDataMap';

type PlantsDashboardViewProps = {
  projectId?: number;
  organizationId?: number;
};

export default function PlantsDashboardView({ projectId, organizationId }: PlantsDashboardViewProps): JSX.Element {
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState(-1);
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const theme = useTheme();
  const plantingSites: PlantingSite[] | undefined = useAppSelector(selectPlantingSites);
  const summaries = useObservationSummaries(selectedPlantingSiteId);
  const defaultTimeZone = useDefaultTimeZone();
  const latestObservation = useAppSelector((state) =>
    selectLatestObservation(state, selectedPlantingSiteId, defaultTimeZone.get().id)
  );

  const hasObservations = useMemo(() => !!latestObservation, [latestObservation]);

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

  const organizationIdToUse = useMemo(
    () => (organizationId ? organizationId : org.selectedOrganization.id),
    [organizationId, org.selectedOrganization.id]
  );

  const onSelect = useCallback(
    (site: PlantingSite) => {
      setSelectedPlantingSiteId(site.id);
    },
    [setSelectedPlantingSiteId]
  );
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const latestObservationId = useMemo(() => {
    return latestObservation?.observationId;
  }, [latestObservation]);

  const geometryChangedNote = useMemo(() => {
    if (selectedPlantingSiteId !== -1 && latestObservation) {
      const pSite = plantingSites?.find((ps) => ps.id === selectedPlantingSiteId);
      if (pSite?.plantingZones?.length && pSite?.plantingZones?.length > 0) {
        const maxModifiedTime = pSite.plantingZones.reduce(
          (acc, zone) => (isAfter(zone.boundaryModifiedTime, acc) ? zone.boundaryModifiedTime : acc),
          pSite.plantingZones[0].boundaryModifiedTime
        );
        const maxModifiedDate = DateTime.fromISO(maxModifiedTime).toFormat('yyyy-MM-dd');

        if (
          (latestObservation.completedTime && isAfter(maxModifiedTime, latestObservation.completedTime)) ||
          (!latestObservation.completedTime && isAfter(maxModifiedDate, latestObservation.startDate))
        ) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }, [latestObservation, plantingSites, selectedPlantingSiteId]);

  useEffect(() => {
    dispatch(requestObservations(organizationIdToUse));
    dispatch(requestObservationsResults(organizationIdToUse));
    dispatch(requestSpecies(organizationIdToUse));
    dispatch(requestPlantings(organizationIdToUse));
    dispatch(requestPlantingSitesSearchResults(organizationIdToUse));
  }, [dispatch, organizationIdToUse]);

  useEffect(() => {
    if (organizationId) {
      dispatch(requestPlantingSites(organizationId));
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedPlantingSiteId !== -1) {
      dispatch(requestSitePopulation(organizationIdToUse, selectedPlantingSiteId));
      dispatch(requestSiteReportedPlants(selectedPlantingSiteId));
    }
  }, [dispatch, organizationIdToUse, selectedPlantingSiteId]);

  const sectionHeader = (title: string) => (
    <Grid item xs={12}>
      <Typography fontSize='20px' fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  );

  const getLatestObservationLink = useCallback(() => {
    const allMonitoringPlots = latestObservation?.plantingZones.flatMap((pz) =>
      pz.plantingSubzones.flatMap((sz) => sz.monitoringPlots)
    );
    const maxCompletedTime = allMonitoringPlots?.reduce(
      (acc, plot) => (isAfter(plot.completedTime, acc) ? plot.completedTime : acc),
      allMonitoringPlots[0].completedTime
    );
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
          DateTime.fromISO(maxCompletedTime || latestObservation.completedTime).toFormat('yyyy-MM-dd')
        )}
      </Link>
    ) : (
      ''
    );
  }, [latestObservation]);

  const renderMortalityRate = useCallback(
    () => (
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
              <Typography>{strings.formatString(strings.AS_OF_X, getLatestObservationLink())}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <MortalityRateCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      </>
    ),
    [selectedPlantingSiteId, getLatestObservationLink, hasObservations]
  );

  const renderTotalPlantsAndSpecies = useCallback(
    () => (
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
          </Box>
        </Grid>
        <Grid item xs={12}>
          <PlantsAndSpeciesCard
            plantingSiteId={selectedPlantingSiteId}
            hasReportedPlants={hasReportedPlants}
            organizationId={organizationIdToUse}
            projectId={projectId}
          />
        </Grid>
      </>
    ),
    [selectedPlantingSiteId, hasReportedPlants]
  );

  const renderPlantingProgressAndDensity = useCallback(
    () => (
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
              <Typography>{strings.formatString(strings.AS_OF_X, getLatestObservationLink())}</Typography>
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
    ),
    [selectedPlantingSiteId, sitePlantingComplete, hasObservations, getLatestObservationLink]
  );

  const renderPlantingSiteTrends = useCallback(
    () => (
      <>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
              {strings.ZONE_TRENDS}
            </Typography>

            <Typography>{strings.ALL_OBSERVATIONS}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <PlantingSiteTrendsCard plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      </>
    ),
    [selectedPlantingSiteId]
  );

  const renderZoneLevelData = useCallback(
    () => (
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
              {strings.SITE_MAP}
            </Typography>
            {hasObservations && (
              <Typography>{strings.formatString(strings.AS_OF_X, getLatestObservationLink())}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <ZoneLevelDataMap plantingSiteId={selectedPlantingSiteId} />
        </Grid>
      </>
    ),
    [selectedPlantingSiteId, getLatestObservationLink, hasObservations]
  );

  const renderSimpleSiteMap = useCallback(
    () => (
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
    ),
    [selectedPlantingSiteId]
  );

  const hasPolygons = useMemo(
    () => !!plantingSiteResult && !!plantingSiteResult.boundary && plantingSiteResult.boundary.coordinates?.length > 0,
    [plantingSiteResult]
  );

  const hasPlantingZones = useMemo(
    () => !!plantingSiteResult && !!plantingSiteResult.plantingZones && plantingSiteResult.plantingZones.length > 0,
    [plantingSiteResult]
  );

  const getSummariesHectares = useCallback(() => {
    const totalSquareMeters =
      summaries?.[0]?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [summaries]);

  const getObservationHectares = useCallback(() => {
    const totalSquareMeters =
      latestObservation?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [latestObservation]);

  const getDashboardSubhead = useCallback(() => {
    if (selectedPlantingSiteId === -1) {
      return '';
    }

    const earliestDate = summaries?.[0]?.earliestObservationTime
      ? getDateDisplayValue(summaries[0].earliestObservationTime)
      : undefined;
    const latestDate = summaries?.[0]?.latestObservationTime
      ? getDateDisplayValue(summaries[0].latestObservationTime)
      : undefined;
    return !earliestDate || !latestDate || earliestDate === latestDate
      ? (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_SINGLE_OBSERVATION,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={getObservationHectares()} />)}</b>,
          <b>{getLatestObservationLink()}</b>
        ) as string)
      : (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_V2,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={getSummariesHectares()} />)}</b>,
          <b>
            {summaries?.[0]?.earliestObservationTime ? getDateDisplayValue(summaries[0].earliestObservationTime) : ''}
          </b>,
          <b>{summaries?.[0]?.latestObservationTime ? getDateDisplayValue(summaries[0].latestObservationTime) : ''}</b>
        ) as string);
  }, [selectedPlantingSiteId, summaries]);

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      text={latestObservationId ? getDashboardSubhead() : undefined}
      onSelect={onSelect}
      pagePath={
        projectId
          ? APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', projectId.toString())
          : APP_PATHS.PLANTING_SITE_DASHBOARD
      }
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
      newHeader={true}
      showGeometryNote={geometryChangedNote}
      latestObservationId={latestObservationId}
      projectId={projectId}
      organizationId={organizationId}
      isEmptyState={selectedPlantingSiteId === -1}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderTotalPlantsAndSpecies()}
        {hasObservations && selectedPlantingSiteId !== -2 && renderMortalityRate()}
        {selectedPlantingSiteId !== -2 && renderPlantingProgressAndDensity()}
        {hasObservations && selectedPlantingSiteId !== -2 && renderPlantingSiteTrends()}
        {hasPlantingZones && renderZoneLevelData()}
        {hasPolygons && !hasPlantingZones && renderSimpleSiteMap()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
