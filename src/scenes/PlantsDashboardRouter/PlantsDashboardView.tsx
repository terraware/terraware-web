import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import {
  requestPlantingSitesSearchResults,
  requestSitePopulation,
  requestSiteReportedPlants,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';

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
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const theme = useTheme();

  const {
    setAcceleratorOrganizationId,
    plantingSite,
    setSelectedPlantingSite,
    latestObservation,
    observationSummaries,
  } = usePlantingSiteData();

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

  const sitePlantingComplete = useMemo(() => {
    return (
      plantingSite?.plantingZones?.flatMap((zone) => zone.plantingSubzones)?.every((sz) => sz.plantingCompleted) ??
      false
    );
  }, [plantingSite]);

  const onSelect = useCallback(
    (site: PlantingSite) => {
      setSelectedPlantingSite(site.id);
    },
    [setSelectedPlantingSite]
  );
  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const latestObservationId = useMemo(() => {
    return latestObservation?.observationId;
  }, [latestObservation]);

  const geometryChangedNote = useMemo(() => {
    if (latestObservation?.completedTime && plantingSite?.plantingZones?.length) {
      const siteBoundaryModifiedTime = plantingSite.plantingZones.reduce(
        (maxTime, zone) => (isAfter(zone.boundaryModifiedTime, maxTime) ? zone.boundaryModifiedTime : maxTime),
        plantingSite.plantingZones[0].boundaryModifiedTime
      );
      return isAfter(siteBoundaryModifiedTime, latestObservation.completedTime);
    } else {
      return false;
    }
  }, [latestObservation, plantingSite]);

  useEffect(() => {
    const orgId = organizationId ?? selectedOrganization.id;
    void dispatch(requestSpecies(orgId));
    void dispatch(requestPlantings(orgId));
    void dispatch(requestPlantingSitesSearchResults(orgId));
    setAcceleratorOrganizationId(orgId);
  }, [dispatch, organizationId, selectedOrganization]);

  useEffect(() => {
    if (plantingSite?.id) {
      const orgId = organizationId ?? selectedOrganization.id;
      void dispatch(requestSitePopulation(orgId, plantingSite?.id));
      void dispatch(requestSiteReportedPlants(plantingSite?.id));
    }
  }, [dispatch, organizationId, plantingSite, selectedOrganization]);

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
    return plantingSite && latestObservation?.completedTime ? (
      <Link
        fontSize={'16px'}
        to={APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', plantingSite?.id.toString()).replace(
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
    () =>
      plantingSite ? (
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
            <MortalityRateCard />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, getLatestObservationLink, hasObservations]
  );

  const renderTotalPlantsAndSpecies = useCallback(
    () =>
      plantingSite ? (
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
            <PlantsAndSpeciesCard plantingSiteId={plantingSite.id} hasReportedPlants={hasReportedPlants} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, hasReportedPlants]
  );

  const renderPlantingProgressAndDensity = useCallback(
    () =>
      plantingSite ? (
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
            <PlantingDensityCard hasObservations={hasObservations} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, sitePlantingComplete, hasObservations, getLatestObservationLink]
  );

  const renderPlantingSiteTrends = useCallback(
    () =>
      plantingSite ? (
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
            <PlantingSiteTrendsCard />
          </Grid>
        </>
      ) : undefined,
    [plantingSite]
  );

  const renderZoneLevelData = useCallback(
    () =>
      plantingSite ? (
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
            <ZoneLevelDataMap plantingSiteId={plantingSite.id} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, getLatestObservationLink, hasObservations]
  );

  const renderSimpleSiteMap = useCallback(
    () =>
      plantingSite ? (
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
              <SimplePlantingSiteMap plantingSiteId={plantingSite.id} />
            </Box>
          </Grid>
        </>
      ) : undefined,
    [plantingSite]
  );

  const hasPolygons = useMemo(
    () => !!plantingSite && !!plantingSite.boundary && plantingSite.boundary.coordinates?.length > 0,
    [plantingSite]
  );

  const hasPlantingZones = useMemo(
    () => !!plantingSite && !!plantingSite.plantingZones && plantingSite.plantingZones.length > 0,
    [plantingSite]
  );

  const summariesHectares = useMemo(() => {
    const totalSquareMeters =
      observationSummaries?.[0]?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [observationSummaries]);

  const observationHectares = useMemo(() => {
    const totalSquareMeters =
      latestObservation?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [latestObservation]);

  const getDashboardSubhead = useCallback(() => {
    if (!plantingSite) {
      return strings.FIRST_ADD_PLANTING_SITE;
    }

    const earliestDate = observationSummaries?.[0]?.earliestObservationTime
      ? getDateDisplayValue(observationSummaries[0].earliestObservationTime)
      : undefined;
    const latestDate = observationSummaries?.[0]?.latestObservationTime
      ? getDateDisplayValue(observationSummaries[0].latestObservationTime)
      : undefined;
    return !earliestDate || !latestDate || earliestDate === latestDate
      ? (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_SINGLE_OBSERVATION,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={observationHectares} />)}</b>,
          <b>{getLatestObservationLink()}</b>
        ) as string)
      : (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_V2,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={summariesHectares} />)}</b>,
          <b>
            {observationSummaries?.[0]?.earliestObservationTime
              ? getDateDisplayValue(observationSummaries[0].earliestObservationTime)
              : ''}
          </b>,
          <b>
            {observationSummaries?.[0]?.latestObservationTime
              ? getDateDisplayValue(observationSummaries[0].latestObservationTime)
              : ''}
          </b>
        ) as string);
  }, [plantingSite, observationSummaries, observationHectares]);

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
      isEmptyState={plantingSite === undefined}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderTotalPlantsAndSpecies()}
        {hasObservations && renderMortalityRate()}
        {renderPlantingProgressAndDensity()}
        {hasObservations && renderPlantingSiteTrends()}
        {hasPlantingZones && renderZoneLevelData()}
        {hasPolygons && !hasPlantingZones && renderSimpleSiteMap()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
