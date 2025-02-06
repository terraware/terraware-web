import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  requestPlantingSitesSearchResults,
  requestSitePopulation,
  requestSiteReportedPlants,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';
import { isAdmin } from 'src/utils/organization';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import EmptyMessage from '../../components/common/EmptyMessage';
import FormattedNumber from '../../components/common/FormattedNumber';
import MortalityRateCard from './components/MortalityRateCard';
import PlantingDensityCard from './components/PlantingDensityCard';
import PlantingSiteTrendsCard from './components/PlantingSiteTrendsCard';
import PlantsAndSpeciesCard from './components/PlantsAndSpeciesCard';
import ZoneLevelDataMap from './components/ZoneLevelDataMap';

export default function PlantsDashboardView(): JSX.Element {
  const org = useOrganization();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState(-1);
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<Record<string, unknown>>();
  const navigate = useNavigate();
  const theme = useTheme();
  const plantingSites: PlantingSite[] | undefined = useAppSelector(selectPlantingSites);
  const summaries = useObservationSummaries(selectedPlantingSiteId);

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

        if (isAfter(maxModifiedDate, latestObservation.startDate)) {
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

  const renderMortalityRate = () => (
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
        <PlantsAndSpeciesCard plantingSiteId={selectedPlantingSiteId} hasReportedPlants={hasReportedPlants} />
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
  );

  const renderPlantingSiteTrends = () => (
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
  );

  const renderZoneLevelData = () => (
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

  const getSummariesHectares = useCallback(() => {
    const totalSquareMeters =
      summaries?.[0]?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  }, [summaries]);

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

  const getObservationHectares = () => {
    const totalSquareMeters =
      latestObservation?.plantingZones
        .flatMap((pz) =>
          pz.plantingSubzones.flatMap((psz) => psz.monitoringPlots.map((mp) => mp.sizeMeters * mp.sizeMeters))
        )
        .reduce((acc, area) => acc + area, 0) ?? 0;

    return totalSquareMeters * SQ_M_TO_HECTARES;
  };

  const getDashboardSubhead = () => {
    if (selectedPlantingSiteId === -1) {
      return strings.FIRST_ADD_PLANTING_SITE;
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
      newHeader={true}
      showGeometryNote={geometryChangedNote}
      latestObservationId={latestObservationId}
    >
      {selectedPlantingSiteId !== -1 ? (
        <Grid container spacing={3} alignItems='flex-start' height='fit-content'>
          {renderTotalPlantsAndSpecies()}
          {hasObservations && renderMortalityRate()}
          {renderPlantingProgressAndDensity()}
          {hasObservations && renderPlantingSiteTrends()}
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
