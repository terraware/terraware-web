import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import SurvivalRateRecalculationMessage from 'src/components/SurvivalRate/SurvivalRateRecalculationMessage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import usePlantingSite from 'src/hooks/usePlantingSite';
import useStickyPlantingSiteId, { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import useSurvivalRateCalculationInProgress from 'src/hooks/useSurvivalRateCalculationInProgress';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';

import EmptyPlantingSiteMap from './components/EmptyPlantingSiteMap';
import LatestObservationLink from './components/LatestObservationLink';
import MultiplePlantingSiteMap from './components/MultiplePlantingSiteMap';
import PlantDashboardMap from './components/PlantDashboardMap';
import PlantingDensityCard from './components/PlantingDensityCard';
import PlantingSiteTrendsCard from './components/PlantingSiteTrendsCard';
import PlantsAndSpeciesCard from './components/PlantsAndSpeciesCard';
import PlantsDashboardHeader from './components/PlantsDashboardHeader';
import SurvivalRateCard from './components/SurvivalRateCard';
import useDashboardPlantingSites from './useDashboardPlantingSites';

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
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [projectId, setProjectId] = useState<ProjectId>(acceleratorProjectId ?? ALL_PLANTING_SITES);
  const isProjectSelected = typeof projectId === 'number';

  const { plantingSiteId: plantingSiteIdParam } = useParams<{ plantingSiteId: string }>();

  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId(PREFERENCE_NAME);

  const { setAcceleratorOrganizationId } = useSpeciesData();

  // The header owns selection normalization; the view only needs `showAllSitesOption` to label the
  // totals section. The scoped query is shared (RTK cache) with the header.
  const { showAllSitesOption } = useDashboardPlantingSites(projectId);

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

  const { plantingSite } = usePlantingSite(
    selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId
  );

  // Poll for survival rate recalculation and refresh observation results when it completes.
  const { inProgress: survivalRateRecalculationInProgress } = useSurvivalRateCalculationInProgress(plantingSite?.id);
  const hasObservationResults = useMemo(() => !!plantingSite?.latestObservationId, [plantingSite]);

  useEffect(() => {
    if (organizationId) {
      setAcceleratorOrganizationId(organizationId);
    } else if (!isAcceleratorRoute && selectedOrganization?.id) {
      setAcceleratorOrganizationId(selectedOrganization?.id);
    }
  }, [isAcceleratorRoute, organizationId, selectedOrganization?.id, setAcceleratorOrganizationId]);

  const sectionHeader = (title: string) => (
    <Grid item xs={12}>
      <Typography fontSize='20px' fontWeight={600}>
        {title}
      </Typography>
    </Grid>
  );

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
                <Typography>
                  {strings.formatString(strings.AS_OF_X, <LatestObservationLink plantingSite={plantingSite} />)}
                </Typography>
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
            {selectedPlantingSiteId === ALL_PLANTING_SITES && showAllSitesOption
              ? strings.PROJECT_AREA_TOTALS
              : strings.PLANTING_SITE_TOTALS}
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
                <Typography>
                  {strings.formatString(strings.AS_OF_X, <LatestObservationLink plantingSite={plantingSite} />)}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <PlantingDensityCard hasObservations={hasObservationResults} plantingSiteId={plantingSite?.id} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, isMobile, hasObservationResults, strings, theme]
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
                <Typography>
                  {strings.formatString(strings.AS_OF_X, <LatestObservationLink plantingSite={plantingSite} />)}
                </Typography>
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
    [hasObservationResults, isMobile, plantingSite, strings, theme]
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

  return (
    <PlantsDashboardHeader
      selectedPlantingSiteId={selectedPlantingSiteId}
      onSelectPlantingSite={selectPlantingSite}
      projectId={projectId}
      onSelectProject={setProjectId}
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
