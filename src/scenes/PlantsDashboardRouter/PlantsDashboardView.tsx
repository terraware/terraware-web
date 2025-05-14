import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useAppDispatch } from 'src/redux/store';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
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
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const {
    setAcceleratorOrganizationId,
    setSelectedPlantingSite,
    allPlantingSites,
    plantingSite,
    latestResult,
    observationSummaries,
  } = usePlantingSiteData();

  const hasObservations = useMemo(() => !!latestResult, [latestResult]);

  const sitePlantingComplete = useMemo(() => {
    return (
      plantingSite?.plantingZones?.flatMap((zone) => zone.plantingSubzones)?.every((sz) => sz.plantingCompleted) ??
      false
    );
  }, [plantingSite]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const latestResultId = useMemo(() => {
    return latestResult?.observationId;
  }, [latestResult]);

  const geometryChangedNote = useMemo(() => {
    if (latestResult?.completedTime && plantingSite?.plantingZones?.length) {
      const siteBoundaryModifiedTime = plantingSite.plantingZones.reduce(
        (maxTime, zone) => (isAfter(zone.boundaryModifiedTime, maxTime) ? zone.boundaryModifiedTime : maxTime),
        plantingSite.plantingZones[0].boundaryModifiedTime
      );
      return isAfter(siteBoundaryModifiedTime, latestResult.completedTime);
    } else {
      return false;
    }
  }, [latestResult, plantingSite]);

  useEffect(() => {
    const orgId = organizationId ?? selectedOrganization.id;
    setAcceleratorOrganizationId(orgId);
  }, [dispatch, organizationId, selectedOrganization, setAcceleratorOrganizationId]);

  const sectionHeader = (title: string) => (
    <Grid item xs={12}>
      <Typography fontSize='20px' fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  );

  const renderLatestObservationLink = useCallback(() => {
    const allMonitoringPlots = latestResult?.plantingZones.flatMap((pz) =>
      pz.plantingSubzones.flatMap((sz) => sz.monitoringPlots)
    );
    const maxCompletedTime = allMonitoringPlots?.reduce(
      (acc, plot) => (isAfter(plot.completedTime, acc) ? plot.completedTime : acc),
      allMonitoringPlots[0].completedTime
    );
    return plantingSite && latestResult?.completedTime ? (
      <Link
        fontSize={'16px'}
        to={APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', plantingSite?.id.toString()).replace(
          ':observationId',
          latestResult.observationId.toString()
        )}
      >
        {strings.formatString(
          strings.DATE_OBSERVATION,
          DateTime.fromISO(maxCompletedTime || latestResult.completedTime).toFormat('yyyy-MM-dd')
        )}
      </Link>
    ) : (
      ''
    );
  }, [latestResult]);

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
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <MortalityRateCard />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, renderLatestObservationLink, hasObservations]
  );

  const renderTotalPlantsAndSpecies = () => (
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
        <PlantsAndSpeciesCard />
      </Grid>
    </>
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
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <PlantingDensityCard hasObservations={hasObservations} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, sitePlantingComplete, hasObservations, renderLatestObservationLink]
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
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <ZoneLevelDataMap plantingSiteId={plantingSite.id} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, renderLatestObservationLink, hasObservations]
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
      latestResult?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [latestResult]);

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
          <b>{renderLatestObservationLink()}</b>
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

  const onSelect = useCallback(
    (plantingSiteId: number) => {
      setSelectedPlantingSite(plantingSiteId);
    },
    [setSelectedPlantingSite]
  );

  return (
    <PlantsPrimaryPage
      title={strings.DASHBOARD}
      text={latestResultId ? getDashboardSubhead() : undefined}
      pagePath={
        projectId
          ? APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', projectId.toString())
          : APP_PATHS.PLANTING_SITE_DASHBOARD
      }
      lastVisitedPreferenceName='plants.dashboard.lastVisitedPlantingSite'
      plantingSitesData={allPlantingSites ?? []}
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
      newHeader={true}
      showGeometryNote={geometryChangedNote}
      latestObservationId={latestResultId}
      projectId={projectId}
      organizationId={organizationId}
      isEmptyState={plantingSite === undefined}
      onSelect={onSelect}
      allowAllAsSiteSelection={isAcceleratorRoute}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderTotalPlantsAndSpecies()}
        {hasObservations && plantingSite?.id !== -1 && renderMortalityRate()}
        {plantingSite?.id !== -1 && renderPlantingProgressAndDensity()}
        {hasObservations && plantingSite?.id !== -1 && renderPlantingSiteTrends()}
        {hasPlantingZones && renderZoneLevelData()}
        {hasPolygons && !hasPlantingZones && renderSimpleSiteMap()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
