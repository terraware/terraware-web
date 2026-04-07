import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS, SQ_M_TO_HECTARES } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useObservation from 'src/hooks/useObservation';
import useObservationResults from 'src/hooks/useObservationResults';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useListObservationSummariesQuery } from 'src/queries/generated/observations';
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
  const { latestObservationResult } = useObservationResults({
    plantingSiteId: selectedPlantingSiteId && selectedPlantingSiteId !== -1 ? selectedPlantingSiteId : undefined,
  });

  const plantingSiteId = plantingSite?.id;
  const observationSummariesQuery = useListObservationSummariesQuery(
    { plantingSiteId: plantingSiteId ?? -1 },
    { skip: !plantingSiteId || plantingSiteId === -1 }
  );
  const observationSummaries = observationSummariesQuery.data?.summaries;

  const hasObservationResults = useMemo(() => !!latestObservationResult, [latestObservationResult]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsDashboardPreferences(preferences),
    [setPlantsDashboardPreferences]
  );

  const latestObservationResultId = useMemo(() => {
    return latestObservationResult?.observationId;
  }, [latestObservationResult]);

  const { observationResults } = useObservation(latestObservationResultId, { resultsOnly: true });

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
    if (latestObservationResult?.completedTime && siteBoundaryModifiedTime) {
      return isAfter(siteBoundaryModifiedTime, latestObservationResult.completedTime);
    } else {
      return false;
    }
  }, [latestObservationResult, siteBoundaryModifiedTime]);

  const geometryChangedDate = useMemo(() => {
    const dt = siteBoundaryModifiedTime ? DateTime.fromISO(siteBoundaryModifiedTime) : undefined;
    return dt?.isValid ? dt.toFormat('LLLL d, yyyy') : undefined;
  }, [siteBoundaryModifiedTime]);

  const latestObservationDate = useMemo(() => {
    const dt = latestObservationResult?.completedTime
      ? DateTime.fromISO(latestObservationResult.completedTime)
      : undefined;
    return dt?.isValid ? dt.toFormat('LLLL d, yyyy') : undefined;
  }, [latestObservationResult]);

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

  const latestSummary = useMemo(
    () => (observationSummaries && observationSummaries.length > 0 ? observationSummaries[0] : undefined),
    [observationSummaries]
  );

  const showSurvivalRateMessage = useMemo(() => {
    return hasObservationResults && latestSummary?.survivalRate === undefined;
  }, [hasObservationResults, latestSummary]);

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
  }, [plantingSite, isAcceleratorRoute]);

  const renderSurvivalRate = useCallback(
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
              {hasObservationResults && (
                <Typography>{strings.formatString(strings.AS_OF_X, renderLatestObservationLink())}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <SurvivalRateCard plantingSiteId={plantingSite?.id} />
          </Grid>
        </>
      ) : undefined,
    [plantingSite, isMobile, hasObservationResults, renderLatestObservationLink]
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
    [plantingSite, isMobile, hasObservationResults, renderLatestObservationLink, theme]
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
    [plantingSite, theme]
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
    [
      hasObservationResults,
      isMobile,
      observationResults,
      latestSummary,
      plantingSite,
      renderLatestObservationLink,
      theme,
    ]
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

  const hasStrata = useMemo(
    () => !!plantingSite && !!plantingSite.strata && plantingSite.strata.length > 0,
    [plantingSite]
  );

  const summariesHectares = useMemo(() => {
    const totalSquareMeters =
      observationSummaries?.[0]?.strata
        .flatMap((_stratum) =>
          _stratum.substrata.flatMap((_substratum) =>
            _substratum.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters)
          )
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [observationSummaries]);

  const observationHectares = useMemo(() => {
    const totalSquareMeters =
      latestObservationResult?.strata
        .flatMap((_stratum) =>
          _stratum.substrata.flatMap((_substratum) =>
            _substratum.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters)
          )
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [latestObservationResult]);

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
            {projectId && <MultiplePlantingSiteMap projectId={projectId} />}
          </Box>
        </Grid>
      </>
    );
  }, [theme, projectId]);

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
        {hasObservationResults && selectedPlantingSiteId !== -1 && renderSurvivalRate()}
        {selectedPlantingSiteId !== -1 && hasStrata && renderStratumLevelData()}
        {selectedPlantingSiteId !== -1 && hasPolygons && !hasStrata && renderSimpleSiteMap()}
        {(selectedPlantingSiteId === -1 || !plantingSite) && renderMapWithSites()}
      </Grid>
    </PlantsPrimaryPage>
  );
}
