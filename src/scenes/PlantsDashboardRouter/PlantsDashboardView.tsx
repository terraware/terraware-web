import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useObservation from 'src/hooks/useObservation';
import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useAppDispatch } from 'src/redux/store';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { isAfter } from 'src/utils/dateUtils';

import MultiplePlantingSiteMap from './components/MultiplePlantingSiteMap';
import PlantDashboardMap from './components/PlantDashboardMap';
import PlantingDensityCard from './components/PlantingDensityCard';
import PlantingSiteTrendsCard from './components/PlantingSiteTrendsCard';
import PlantsAndSpeciesCard from './components/PlantsAndSpeciesCard';
import SurvivalRateCard from './components/SurvivalRateCard';

type PlantsDashboardViewProps = {
  projectId?: number;
  organizationId?: number;
};

export default function PlantsDashboardView({
  projectId: acceleratorProjectId,
  organizationId,
}: PlantsDashboardViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const [projectId, setProjectId] = useState<number | undefined>(acceleratorProjectId);

  const {
    setAcceleratorOrganizationId,
    setSelectedPlantingSite,
    allPlantingSites,
    plantingSite,
    latestResult,
    observationSummaries,
    isLoading,
    acceleratorOrganizationId,
  } = usePlantingSiteData();

  const hasObservations = useMemo(() => !!latestResult, [latestResult]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const latestResultId = useMemo(() => {
    return latestResult?.observationId;
  }, [latestResult]);

  const { observationResults } = useObservation(latestResultId);

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
    if (organizationId) {
      setAcceleratorOrganizationId(organizationId);
    } else if (!isAcceleratorRoute && selectedOrganization?.id) {
      setAcceleratorOrganizationId(selectedOrganization?.id);
    }
  }, [
    acceleratorOrganizationId,
    dispatch,
    isAcceleratorRoute,
    organizationId,
    selectedOrganization?.id,
    setAcceleratorOrganizationId,
  ]);

  const latestSummary = useMemo(
    () => (observationSummaries && observationSummaries.length > 0 ? observationSummaries[0] : undefined),
    [observationSummaries]
  );

  const showSurvivalRateMessage = useMemo(() => {
    return hasObservations && latestSummary?.survivalRate === undefined;
  }, [hasObservations, latestSummary]);

  const sectionHeader = (title: string) => (
    <Grid item xs={12}>
      <Typography fontSize='20px' fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  );

  const renderLatestObservationLink = useCallback(() => {
    return plantingSite?.latestObservationId && plantingSite.latestObservationCompletedTime ? (
      isAcceleratorRoute ? (
        <Typography fontSize={'16px'} display={'inline'}>
          {strings.formatString(
            strings.DATE_OBSERVATION,
            DateTime.fromISO(plantingSite.latestObservationCompletedTime).toFormat('yyyy-MM-dd')
          )}
        </Typography>
      ) : (
        <Link
          fontSize={'16px'}
          to={APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', plantingSite?.id.toString()).replace(
            ':observationId',
            plantingSite.latestObservationId.toString()
          )}
        >
          {strings.formatString(
            strings.DATE_OBSERVATION,
            DateTime.fromISO(plantingSite.latestObservationCompletedTime).toFormat('yyyy-MM-dd')
          )}
        </Link>
      )
    ) : (
      ''
    );
  }, [plantingSite, isAcceleratorRoute]);

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
              <Typography fontWeight={600} fontSize={'20px'} paddingRight={1} paddingLeft={3}>
                {strings.SURVIVAL_RATE}
              </Typography>
              {hasObservations && (
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <SurvivalRateCard />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, isMobile, hasObservations, renderLatestObservationLink]
  );

  const renderTotalPlantsAndSpecies = () => (
    <>
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            paddingLeft: theme.spacing(3),
          }}
        >
          <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
            {plantingSite?.id === -1 ? strings.PROJECT_AREA_TOTALS : strings.PLANTING_SITE_TOTALS}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <PlantsAndSpeciesCard projectId={projectId} />
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
                paddingLeft: theme.spacing(3),
              }}
            >
              <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
                {strings.PLANT_DENSITY}
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
    [plantingSite, isMobile, hasObservations, renderLatestObservationLink, theme]
  );

  const renderPlantingSiteTrends = useCallback(
    () =>
      plantingSite ? (
        <>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: theme.spacing(3) }}>
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
    [plantingSite, theme]
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
              <Typography fontWeight={600} fontSize={'20px'} paddingRight={1} paddingLeft={3}>
                {strings.SITE_MAP}
              </Typography>
              {hasObservations && (
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.TwClrBg,
                borderRadius: '8px',
                padding: theme.spacing(1),
                gap: theme.spacing(3),
              }}
            >
              <Typography fontSize='20px' fontWeight={600}>
                {plantingSite?.areaHa !== undefined &&
                  strings.formatString(
                    strings.X_HA_IN_TOTAL_PLANTING_AREA,
                    <FormattedNumber value={Math.round(plantingSite.areaHa * 100) / 100} />
                  )}
              </Typography>
              <PlantDashboardMap
                observationResults={observationResults ? [observationResults] : []}
                latestSummary={latestSummary}
                plantingSites={plantingSite ? [plantingSite] : []}
              />
            </Box>
          </Grid>
        </>
      ) : undefined,
    [hasObservations, isMobile, observationResults, latestSummary, plantingSite, renderLatestObservationLink, theme]
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
    [plantingSite, theme]
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
  }, [plantingSite, observationSummaries, observationHectares, renderLatestObservationLink, summariesHectares]);

  const onSelect = useCallback(
    (plantingSiteId: number) => {
      setSelectedPlantingSite(plantingSiteId);
    },
    [setSelectedPlantingSite]
  );

  const onSelectProject = useCallback((newProjectId: number) => {
    setProjectId(newProjectId === -1 ? undefined : newProjectId);
  }, []);

  const renderMapWithSites = useCallback(() => {
    return (
      <>
        {sectionHeader(strings.PROJECT_AREA_MAP)}
        <Grid item xs={12}>
          <Box
            sx={{
              background: theme.palette.TwClrBg,
              borderRadius: '24px',
              padding: theme.spacing(3),
              gap: theme.spacing(3),
            }}
          >
            {(organizationId || selectedOrganization?.id) && (
              <MultiplePlantingSiteMap
                projectId={projectId!}
                organizationId={organizationId ?? selectedOrganization?.id ?? -1}
              />
            )}
          </Box>
        </Grid>
      </>
    );
  }, [theme, organizationId, selectedOrganization?.id, projectId]);

  return (
    <PlantsPrimaryPage
      title={isAcceleratorRoute ? '' : strings.PLANTS_DASHBOARD}
      text={
        plantingSite?.id !== -1
          ? plantingSite
            ? latestResultId
              ? getDashboardSubhead()
              : undefined
            : getDashboardSubhead()
          : undefined
      }
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
      showSurvivalRateMessage={showSurvivalRateMessage}
      latestObservationId={latestResultId}
      projectId={projectId}
      onSelectProjectId={onSelectProject}
      organizationId={organizationId}
      isEmptyState={isLoading ? false : (allPlantingSites?.length ?? 0) <= 1}
      onSelect={onSelect}
      allowAllAsSiteSelection={isAcceleratorRoute || projectId !== undefined}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderTotalPlantsAndSpecies()}
        {hasObservations && plantingSite?.id !== -1 && renderPlantingSiteTrends()}
        {plantingSite?.id !== -1 && hasObservations && renderPlantingProgressAndDensity()}
        {hasObservations && plantingSite?.id !== -1 && renderMortalityRate()}
        {plantingSite?.id !== -1 && hasPlantingZones && renderZoneLevelData()}
        {plantingSite?.id !== -1 && hasPolygons && !hasPlantingZones && renderSimpleSiteMap()}
        {(plantingSite?.id === -1 || !plantingSite) && renderMapWithSites()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
