import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import SurvivalRateRecalculationMessage from 'src/components/SurvivalRate/SurvivalRateRecalculationMessage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS, MONITORING_PLOT_SIZE, SQ_M_TO_HECTARES } from 'src/constants';
import { useLatestSiteObservationResult } from 'src/hooks/observations';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import usePlantingSite from 'src/hooks/usePlantingSite';
import useStickyPlantingSiteId, { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import useSurvivalRateCalculationInProgress from 'src/hooks/useSurvivalRateCalculationInProgress';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useListProjectsQuery } from 'src/queries/generated/projects';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import { isAfter } from 'src/utils/dateUtils';

import EmptyPlantingSiteMap from './components/EmptyPlantingSiteMap';
import MultiplePlantingSiteMap from './components/MultiplePlantingSiteMap';
import PlantDashboardMap from './components/PlantDashboardMap';
import PlantingDensityCard from './components/PlantingDensityCard';
import PlantingSiteTrendsCard from './components/PlantingSiteTrendsCard';
import PlantsAndSpeciesCard from './components/PlantsAndSpeciesCard';
import PlantsDashboardHeader from './components/PlantsDashboardHeader';
import SurvivalRateCard from './components/SurvivalRateCard';

type PlantsDashboardViewProps = {
  projectId?: number;
  organizationId?: number;
};

// 'all' projects means no project filter (the legacy "No Project" option).
type ProjectId = number | typeof ALL_PLANTING_SITES;

const PREFERENCE_NAME = 'plants.dashboard.lastVisitedPlantingSite';

export default function PlantsDashboardView({
  projectId: acceleratorProjectId,
  organizationId,
}: PlantsDashboardViewProps): JSX.Element {
  const { strings, activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [projectId, setProjectId] = useState<ProjectId>(acceleratorProjectId ?? ALL_PLANTING_SITES);
  const isProjectSelected = typeof projectId === 'number';

  const { plantingSiteId: plantingSiteIdParam } = useParams<{ plantingSiteId: string }>();

  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId(PREFERENCE_NAME);

  const { acceleratorOrganizationId, setAcceleratorOrganizationId } = useSpeciesData();
  const { plantingSites, isLoading, isSuccess } = useOrganizationPlantingSites({
    organizationId: isAcceleratorRoute ? acceleratorOrganizationId : undefined,
  });

  const { data: projectsData } = useListProjectsQuery(selectedOrganization?.id, { skip: !selectedOrganization });

  // Sites available for selection, scoped to the chosen project (if any).
  const projectSites = useMemo(
    () => (isProjectSelected ? plantingSites.filter((site) => site.projectId === projectId) : plantingSites),
    [isProjectSelected, plantingSites, projectId]
  );

  const allowAllSitesOption = isAcceleratorRoute || isProjectSelected;
  const showAllSitesOption = allowAllSitesOption && projectSites.length > 1;

  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    const siteOptions = projectSites.map((site) => ({ label: site.name, value: site.id }));
    return showAllSitesOption
      ? [{ label: strings.ALL_PLANTING_SITES, value: ALL_PLANTING_SITES }, ...siteOptions]
      : siteOptions;
  }, [projectSites, showAllSitesOption, strings]);

  const projectIdsWithSites = useMemo(
    () => Array.from(new Set(plantingSites.map((site) => site.projectId))),
    [plantingSites]
  );

  const projectOptions = useMemo((): DropdownItem[] => {
    const options: DropdownItem[] =
      projectsData?.projects
        ?.filter((project) => projectIdsWithSites.includes(project.id))
        .map((project) => ({ label: project.name, value: project.id }))
        .sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined)) ?? [];
    options.unshift({ label: strings.NO_PROJECT, value: ALL_PLANTING_SITES });
    return options;
  }, [activeLocale, projectIdsWithSites, projectsData, strings]);

  // Keep the URL :plantingSiteId param in sync with the selection in org mode (no project selected),
  // so a specific site stays bookmarkable/deep-linkable.
  const orgMode = !isAcceleratorRoute && !isProjectSelected;

  useEffect(() => {
    if (!orgMode || !plantingSiteIdParam) {
      return;
    }
    const paramId = Number(plantingSiteIdParam);
    if (!isNaN(paramId) && paramId !== selectedPlantingSiteId) {
      selectPlantingSite(paramId);
    }
    // Only react to the URL param changing (deep-link / back-button); the selection itself is synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantingSiteIdParam]);

  useEffect(() => {
    if (
      orgMode &&
      typeof selectedPlantingSiteId === 'number' &&
      Number(plantingSiteIdParam) !== selectedPlantingSiteId
    ) {
      navigate(APP_PATHS.PLANTING_SITE_DASHBOARD.replace(':plantingSiteId', selectedPlantingSiteId.toString()));
    }
  }, [navigate, orgMode, plantingSiteIdParam, selectedPlantingSiteId]);

  // Normalize the selection to a value that is valid for the current options: fall back to 'all' when
  // it is offered, otherwise the first available site.
  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    const validSiteIds = new Set(projectSites.map((site) => site.id));
    const isValid =
      selectedPlantingSiteId === ALL_PLANTING_SITES ? showAllSitesOption : validSiteIds.has(selectedPlantingSiteId);
    if (!isValid) {
      const fallback: PlantingSiteId | undefined = showAllSitesOption ? ALL_PLANTING_SITES : projectSites[0]?.id;
      if (fallback !== undefined && fallback !== selectedPlantingSiteId) {
        selectPlantingSite(fallback);
      }
    }
  }, [isSuccess, projectSites, selectPlantingSite, selectedPlantingSiteId, showAllSitesOption]);

  const { plantingSite } = usePlantingSite(
    selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId
  );
  const latestObservationResultId = useMemo(() => plantingSite?.latestObservationId, [plantingSite]);
  const latestObservationCompletedTime = useMemo(() => plantingSite?.latestObservationCompletedTime, [plantingSite]);

  const { observation: latestObservationResult } = useLatestSiteObservationResult(
    selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId,
    'Substratum'
  );

  // Poll for survival rate recalculation and refresh observation results when it completes.
  const { inProgress: survivalRateRecalculationInProgress } = useSurvivalRateCalculationInProgress(plantingSite?.id);
  const hasObservationResults = useMemo(() => !!latestObservationResultId, [latestObservationResultId]);

  const totalArea = useMemo(() => projectSites.reduce((sum, site) => sum + (site.areaHa ?? 0), 0), [projectSites]);
  const isRolledUpView = isProjectSelected && selectedPlantingSiteId === ALL_PLANTING_SITES;
  const displayAreaHa = useMemo(() => {
    if (isRolledUpView) {
      return totalArea;
    }
    return plantingSites.find((site) => site.id === selectedPlantingSiteId)?.areaHa ?? 0;
  }, [isRolledUpView, plantingSites, selectedPlantingSiteId, totalArea]);

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

  const showSurvivalRateMessage = useMemo(
    () => hasObservationResults && latestObservationResult?.survivalRate === undefined,
    [hasObservationResults, latestObservationResult]
  );

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
      plantingSite || isProjectSelected ? (
        <>
          {survivalRateRecalculationInProgress && (
            <Grid item xs={12}>
              <SurvivalRateRecalculationMessage inProgress={survivalRateRecalculationInProgress} />
            </Grid>
          )}
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
    [
      plantingSite,
      isMobile,
      hasObservationResults,
      renderLatestObservationLink,
      strings,
      projectId,
      isProjectSelected,
      survivalRateRecalculationInProgress,
    ]
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
            {selectedPlantingSiteId === ALL_PLANTING_SITES ? strings.PROJECT_AREA_TOTALS : strings.PLANTING_SITE_TOTALS}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <PlantsAndSpeciesCard
          plantingSiteId={selectedPlantingSiteId !== ALL_PLANTING_SITES ? plantingSite?.id : undefined}
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

  const headerText =
    selectedPlantingSiteId !== ALL_PLANTING_SITES
      ? plantingSite
        ? latestObservationResultId
          ? getDashboardSubhead()
          : undefined
        : getDashboardSubhead()
      : undefined;

  return (
    <PlantsDashboardHeader
      title={isAcceleratorRoute ? '' : strings.PLANTS_DASHBOARD}
      text={headerText}
      isAcceleratorRoute={isAcceleratorRoute}
      hasSites={plantingSites.length > 0}
      isLoading={isLoading}
      selectedPlantingSiteId={selectedPlantingSiteId}
      plantingSiteOptions={plantingSiteOptions}
      onSelectPlantingSite={selectPlantingSite}
      showAllSitesDivider={showAllSitesOption}
      projectId={projectId}
      projectOptions={projectOptions}
      onSelectProject={setProjectId}
      displayAreaHa={displayAreaHa}
      showGeometryNote={geometryChangedNote}
      latestObservationId={latestObservationResultId}
      geometryChangedDate={geometryChangedDate}
      latestObservationDate={latestObservationDate}
      showSurvivalRateMessage={showSurvivalRateMessage}
    >
      <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
        {renderTotalPlantsAndSpecies()}
        {hasObservationResults && selectedPlantingSiteId !== ALL_PLANTING_SITES && renderPlantingSiteTrends()}
        {selectedPlantingSiteId !== ALL_PLANTING_SITES && hasObservationResults && renderPlantingProgressAndDensity()}
        {((hasObservationResults && selectedPlantingSiteId !== ALL_PLANTING_SITES) ||
          (isProjectSelected && !plantingSite)) &&
          renderSurvivalRate()}
        {selectedPlantingSiteId !== ALL_PLANTING_SITES && hasStrata && renderStratumLevelData()}
        {selectedPlantingSiteId !== ALL_PLANTING_SITES && hasPolygons && !hasStrata && renderSimpleSiteMap()}
        {(selectedPlantingSiteId === ALL_PLANTING_SITES || !plantingSite) && (
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
                {typeof projectId === 'number' ? (
                  <MultiplePlantingSiteMap projectId={projectId} />
                ) : (
                  <EmptyPlantingSiteMap />
                )}
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </PlantsDashboardHeader>
  );
}
