import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS, MONITORING_PLOT_SIZE, SQ_M_TO_HECTARES } from 'src/constants';
import { useLatestSiteObservationResult } from 'src/hooks/observations';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import { isAfter } from 'src/utils/dateUtils';

import EmptyPlantingSiteMap from './components/EmptyPlantingSiteMap';
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
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const [projectId, setProjectId] = useState<number | undefined>(acceleratorProjectId);

  const { plantingSiteId: plantingSiteIdParam } = useParams<{ plantingSiteId: string }>();
  const initialPlantingSiteId = plantingSiteIdParam ? Number(plantingSiteIdParam) : undefined;
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>(
    initialPlantingSiteId && !isNaN(initialPlantingSiteId) ? initialPlantingSiteId : undefined
  );

  const { acceleratorOrganizationId, setAcceleratorOrganizationId } = useSpeciesData();
  const { plantingSitesWithAllSitesOption } = useOrganizationPlantingSites({
    organizationId: isAcceleratorRoute ? acceleratorOrganizationId : undefined,
  });
  const { plantingSite } = usePlantingSite(selectedPlantingSiteId);
  const latestObservationResultId = useMemo(() => {
    return plantingSite?.latestObservationId;
  }, [plantingSite]);
  const latestObservationCompletedTime = useMemo(() => {
    return plantingSite?.latestObservationCompletedTime;
  }, [plantingSite]);

  const { observation: latestObservationResult } = useLatestSiteObservationResult(selectedPlantingSiteId, 'Substratum');
  const hasObservationResults = useMemo(() => !!latestObservationResultId, [latestObservationResultId]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const siteBoundaryModifiedTime = useMemo(() => {
    if (plantingSite?.strata?.length) {
      return plantingSite.strata.reduce(
        (maxTime, stratum) => (isAfter(stratum.boundaryModifiedTime, maxTime) ? stratum.boundaryModifiedTime : maxTime),
        plantingSite.strata[0].boundaryModifiedTime
      );
    }
    return undefined;
  }, [plantingSite]);

  const geometryChangedNote = useMemo(() => {
    if (latestObservationCompletedTime && siteBoundaryModifiedTime) {
      return isAfter(siteBoundaryModifiedTime, latestObservationCompletedTime);
    } else {
      return false;
    }
  }, [latestObservationCompletedTime, siteBoundaryModifiedTime]);

  const geometryChangedDate = useMemo(() => {
    const dt = siteBoundaryModifiedTime ? DateTime.fromISO(siteBoundaryModifiedTime) : undefined;
    return dt?.isValid ? dt.toFormat('LLLL d, yyyy') : undefined;
  }, [siteBoundaryModifiedTime]);

  const latestObservationDate = useMemo(() => {
    const dt = latestObservationCompletedTime ? DateTime.fromISO(latestObservationCompletedTime) : undefined;
    return dt?.isValid ? dt.toFormat('LLLL d, yyyy') : undefined;
  }, [latestObservationCompletedTime]);

  useEffect(() => {
    if (organizationId) {
      setAcceleratorOrganizationId(organizationId);
    } else if (!isAcceleratorRoute && selectedOrganization?.id) {
      setAcceleratorOrganizationId(selectedOrganization?.id);
    }
  }, [
    acceleratorOrganizationId,
    isAcceleratorRoute,
    organizationId,
    selectedOrganization?.id,
    setAcceleratorOrganizationId,
  ]);

  const showSurvivalRateMessage = useMemo(() => {
    return hasObservationResults && latestObservationResult?.survivalRate === undefined;
  }, [hasObservationResults, latestObservationResult]);

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
          to={APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', plantingSite.latestObservationId.toString())}
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
  }, [plantingSite, isAcceleratorRoute, strings]);

  const renderSurvivalRate = useCallback(
    () =>
      plantingSite || !!projectId ? (
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
              {hasObservationResults && (
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <SurvivalRateCard plantingSiteId={plantingSite?.id} projectId={projectId} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, isMobile, hasObservationResults, renderLatestObservationLink, strings, projectId]
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
            {selectedPlantingSiteId === -1 ? strings.PROJECT_AREA_TOTALS : strings.PLANTING_SITE_TOTALS}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <PlantsAndSpeciesCard
          plantingSiteId={selectedPlantingSiteId !== -1 ? plantingSite?.id : undefined}
          projectId={projectId}
        />
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
              {hasObservationResults && (
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <PlantingDensityCard hasObservations={hasObservationResults} plantingSiteId={plantingSite?.id} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, isMobile, hasObservationResults, renderLatestObservationLink, strings, theme]
  );

  const renderPlantingSiteTrends = useCallback(
    () =>
      plantingSite ? (
        <>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: theme.spacing(3) }}>
              <Typography fontWeight={600} fontSize={'20px'} paddingRight={1}>
                {strings.STRATUM_TRENDS}
              </Typography>

              <Typography>{strings.ALL_OBSERVATIONS}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <PlantingSiteTrendsCard plantingSiteId={plantingSite?.id} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, strings, theme]
  );

  const renderStratumLevelData = useCallback(
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
              {hasObservationResults && (
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
                    <FormattedNumber value={plantingSite.areaHa} decimals={1} />
                  )}
              </Typography>
              <PlantDashboardMap plantingSiteId={plantingSite.id} />
            </Box>
          </Grid>
        </>
      ) : undefined,
    [hasObservationResults, isMobile, plantingSite, renderLatestObservationLink, strings, theme]
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
    [plantingSite, strings, theme]
  );

  const hasPolygons = useMemo(
    () => !!plantingSite && !!plantingSite.boundary && plantingSite.boundary.coordinates?.length > 0,
    [plantingSite]
  );

  const hasStrata = useMemo(
    () => !!plantingSite && !!plantingSite.strata && plantingSite.strata.length > 0,
    [plantingSite]
  );

  const observedHectares = useMemo(() => {
    const totalPlots = (plantingSite?.strata ?? [])
      .flatMap((stratum) => stratum.substrata)
      .reduce((sum, substratum) => sum + (substratum.latestObservationNumPlots ?? 0), 0);

    return totalPlots * MONITORING_PLOT_SIZE * MONITORING_PLOT_SIZE * SQ_M_TO_HECTARES;
  }, [plantingSite]);

  const observationDateRange = useMemo(() => {
    const times = (plantingSite?.strata ?? [])
      .flatMap((stratum) => stratum.substrata)
      .map((substratum) => substratum.latestObservationCompletedTime)
      .filter((time): time is string => !!time)
      .sort();
    return { earliest: times[0], latest: times[times.length - 1] };
  }, [plantingSite]);

  const getDashboardSubhead = useCallback(() => {
    if (!plantingSite) {
      return strings.FIRST_ADD_PLANTING_SITE;
    }

    const earliestDate = observationDateRange.earliest ? getDateDisplayValue(observationDateRange.earliest) : undefined;
    const latestDate = observationDateRange.latest ? getDateDisplayValue(observationDateRange.latest) : undefined;
    return !earliestDate || !latestDate || earliestDate === latestDate
      ? (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_SINGLE_OBSERVATION,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={observedHectares} />)}</b>,
          <b>{renderLatestObservationLink()}</b>
        ) as string)
      : (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_V2,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={observedHectares} />)}</b>,
          <b>{observationDateRange.earliest ? getDateDisplayValue(observationDateRange.earliest) : ''}</b>,
          <b>{observationDateRange.latest ? getDateDisplayValue(observationDateRange.latest) : ''}</b>
        ) as string);
  }, [plantingSite, observationDateRange, renderLatestObservationLink, observedHectares, strings]);

  const onSelect = useCallback((nextPlantingSiteId: number) => {
    setSelectedPlantingSiteId(nextPlantingSiteId);
  }, []);

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
            {projectId ? <MultiplePlantingSiteMap projectId={projectId} /> : <EmptyPlantingSiteMap />}
          </Box>
        </Grid>
      </>
    );
  }, [theme, projectId, strings]);

  return (
    <PlantsPrimaryPage
      title={isAcceleratorRoute ? '' : strings.PLANTS_DASHBOARD}
      text={
        selectedPlantingSiteId !== -1
          ? plantingSite
            ? latestObservationResultId
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
      plantingSitesData={plantingSitesWithAllSitesOption}
      plantsSitePreferences={plantsDashboardPreferences}
      setPlantsSitePreferences={onPreferences}
      newHeader={true}
      showGeometryNote={geometryChangedNote}
      showSurvivalRateMessage={showSurvivalRateMessage}
      latestObservationId={latestObservationResultId}
      geometryChangedDate={geometryChangedDate}
      latestObservationDate={latestObservationDate}
      projectId={projectId}
      onSelectProjectId={onSelectProject}
      organizationId={organizationId}
      onSelect={onSelect}
      allowAllAsSiteSelection={isAcceleratorRoute || projectId !== undefined}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderTotalPlantsAndSpecies()}
        {hasObservationResults && selectedPlantingSiteId !== -1 && renderPlantingSiteTrends()}
        {selectedPlantingSiteId !== -1 && hasObservationResults && renderPlantingProgressAndDensity()}
        {((hasObservationResults && selectedPlantingSiteId !== -1) || (!!projectId && !plantingSite)) &&
          renderSurvivalRate()}
        {selectedPlantingSiteId !== -1 && hasStrata && renderStratumLevelData()}
        {selectedPlantingSiteId !== -1 && hasPolygons && !hasStrata && renderSimpleSiteMap()}
        {(selectedPlantingSiteId === -1 || !plantingSite) && renderMapWithSites()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
