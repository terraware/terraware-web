import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, GlobalStyles, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Message } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import PlantsDashboardEmptyMessage from 'src/components/emptyStatePages/PlantsDashboardEmptyMessage';
import { APP_PATHS, MONITORING_PLOT_SIZE, SQ_M_TO_HECTARES } from 'src/constants';
import { useLatestSiteObservationResult } from 'src/hooks/observations';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization, useOrganization } from 'src/providers';
import { useListProjectsQuery } from 'src/queries/generated/projects';
import { useLazySearchPlantingSiteProjectsQuery } from 'src/queries/search/plantingSites';
import { isAfter } from 'src/utils/dateUtils';

import useDashboardPlantingSites from '../useDashboardPlantingSites';
import LatestObservationLink from './LatestObservationLink';

export type PlantsDashboardHeaderProps = {
  children: React.ReactNode;
  selectedPlantingSiteId: PlantingSiteId;
  onSelectPlantingSite: (plantingSiteId: PlantingSiteId) => void;
  projectId: number | typeof ALL_PLANTING_SITES;
  onSelectProject: (projectId: number | typeof ALL_PLANTING_SITES) => void;
};

export default function PlantsDashboardHeader({
  children,
  selectedPlantingSiteId,
  onSelectPlantingSite,
  projectId,
  onSelectProject,
}: PlantsDashboardHeaderProps): JSX.Element {
  const { strings, activeLocale } = useLocalization();
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { selectedOrganization } = useOrganization();

  const { organizationId, plantingSites, showAllSitesOption, isLoading, isSuccess } =
    useDashboardPlantingSites(projectId);

  // Project ids that have at least one planting site, used to populate the project dropdown.
  const [searchPlantingSiteProjects, { currentData: projectIdsWithSites }] = useLazySearchPlantingSiteProjectsQuery();
  useEffect(() => {
    if (organizationId !== undefined && !isAcceleratorRoute) {
      void searchPlantingSiteProjects(organizationId, true);
    }
  }, [isAcceleratorRoute, organizationId, searchPlantingSiteProjects]);

  const { data: projectsData } = useListProjectsQuery(selectedOrganization?.id, { skip: !selectedOrganization });

  const isProjectSelected = typeof projectId === 'number';
  const isSiteSelected = typeof selectedPlantingSiteId === 'number';

  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    const siteOptions = plantingSites.map((site) => ({ label: site.name, value: site.id }));
    return showAllSitesOption
      ? [{ label: strings.ALL_PLANTING_SITES, value: ALL_PLANTING_SITES }, ...siteOptions]
      : siteOptions;
  }, [plantingSites, showAllSitesOption, strings]);

  const projectOptions = useMemo((): DropdownItem[] => {
    const options: DropdownItem[] =
      projectsData?.projects
        ?.filter((project) => (projectIdsWithSites ?? []).includes(project.id))
        .map((project) => ({ label: project.name, value: project.id }))
        .sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined)) ?? [];
    options.unshift({ label: strings.NO_PROJECT, value: ALL_PLANTING_SITES });
    return options;
  }, [activeLocale, projectIdsWithSites, projectsData, strings]);

  const hasValidSelection =
    selectedPlantingSiteId === ALL_PLANTING_SITES
      ? showAllSitesOption
      : plantingSites.some((site) => site.id === selectedPlantingSiteId);
  const isReady = useMemo(
    () => isSuccess && (plantingSites.length === 0 || hasValidSelection),
    [hasValidSelection, isSuccess, plantingSites.length]
  );

  // Normalize the selection to a valid option (co-located with the readiness check so they share the
  // same data): fall back to 'all' when it is offered, otherwise the first available site.
  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    const validSiteIds = new Set(plantingSites.map((site) => site.id));
    const isValid =
      selectedPlantingSiteId === ALL_PLANTING_SITES ? showAllSitesOption : validSiteIds.has(selectedPlantingSiteId);
    if (!isValid) {
      const fallback: PlantingSiteId | undefined = showAllSitesOption ? ALL_PLANTING_SITES : plantingSites[0]?.id;
      if (fallback !== undefined && fallback !== selectedPlantingSiteId) {
        onSelectPlantingSite(fallback);
      }
    }
  }, [isSuccess, plantingSites, onSelectPlantingSite, selectedPlantingSiteId, showAllSitesOption]);

  const { plantingSite } = usePlantingSite(
    selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId
  );
  const { observation: latestObservationResult } = useLatestSiteObservationResult(
    selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId,
    'Substratum'
  );

  const latestObservationId = plantingSite?.latestObservationId;
  const hasObservationResults = !!latestObservationId;
  const showSurvivalRateMessage = hasObservationResults && latestObservationResult?.survivalRate === undefined;

  const latestObservationCompletedTime = plantingSite?.latestObservationCompletedTime;
  const siteBoundaryModifiedTime = useMemo(() => {
    if (plantingSite?.strata?.length) {
      return plantingSite.strata.reduce(
        (maxTime, stratum) => (isAfter(stratum.boundaryModifiedTime, maxTime) ? stratum.boundaryModifiedTime : maxTime),
        plantingSite.strata[0].boundaryModifiedTime
      );
    }
    return undefined;
  }, [plantingSite]);

  const showGeometryNote = useMemo(
    () =>
      latestObservationCompletedTime && siteBoundaryModifiedTime
        ? isAfter(siteBoundaryModifiedTime, latestObservationCompletedTime)
        : false,
    [latestObservationCompletedTime, siteBoundaryModifiedTime]
  );

  const geometryChangedDate = useMemo(() => {
    const dt = siteBoundaryModifiedTime ? DateTime.fromISO(siteBoundaryModifiedTime) : undefined;
    return dt?.isValid ? dt.toFormat('LLLL d, yyyy') : undefined;
  }, [siteBoundaryModifiedTime]);

  const latestObservationDate = useMemo(() => {
    const dt = latestObservationCompletedTime ? DateTime.fromISO(latestObservationCompletedTime) : undefined;
    return dt?.isValid ? dt.toFormat('LLLL d, yyyy') : undefined;
  }, [latestObservationCompletedTime]);

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

  // Summary of the selected site's latest observations, shown as the header subhead.
  const observationSummary = useMemo(() => {
    if (!plantingSite) {
      return undefined;
    }

    const earliestDate = observationDateRange.earliest ? getDateDisplayValue(observationDateRange.earliest) : undefined;
    const latestDate = observationDateRange.latest ? getDateDisplayValue(observationDateRange.latest) : undefined;
    return !earliestDate || !latestDate || earliestDate === latestDate
      ? (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_SINGLE_OBSERVATION,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={observedHectares} />)}</b>,
          <b>
            <LatestObservationLink plantingSite={plantingSite} />
          </b>
        ) as string)
      : (strings.formatString(
          strings.DASHBOARD_HEADER_TEXT_V2,
          <b>{strings.formatString(strings.X_HECTARES, <FormattedNumber value={observedHectares} />)}</b>,
          <b>{observationDateRange.earliest ? getDateDisplayValue(observationDateRange.earliest) : ''}</b>,
          <b>{observationDateRange.latest ? getDateDisplayValue(observationDateRange.latest) : ''}</b>
        ) as string);
  }, [plantingSite, observationDateRange, observedHectares, strings]);

  const headerText = useMemo(() => {
    if (plantingSites.length === 0) {
      return strings.FIRST_ADD_PLANTING_SITE;
    }
    return latestObservationId ? observationSummary : undefined;
  }, [latestObservationId, observationSummary, plantingSites.length, strings]);

  const totalArea = useMemo(() => plantingSites.reduce((sum, site) => sum + (site.areaHa ?? 0), 0), [plantingSites]);
  const isRolledUpView = isProjectSelected && selectedPlantingSiteId === ALL_PLANTING_SITES;
  const displayAreaHa = isRolledUpView
    ? totalArea
    : plantingSites.find((site) => site.id === selectedPlantingSiteId)?.areaHa ?? 0;

  const title = isAcceleratorRoute ? '' : strings.PLANTS_DASHBOARD;
  const singleSiteMode = isAcceleratorRoute && plantingSiteOptions.length === 1;

  const [delayedIsReady, setDelayedIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDelayedIsReady(isReady), 1000);
    return () => clearTimeout(timer);
  }, [isReady]);

  const showProjectSelector = !isAcceleratorRoute && projectOptions.length > 1;
  const showSelectorCard = (isAcceleratorRoute || plantingSiteOptions.length > 0) && isReady;

  const Wrapper = isProjectSelected ? Box : TfMain;

  return (
    <Wrapper>
      {title && (
        <Grid item xs={12} paddingLeft={theme.spacing(3)} marginBottom={theme.spacing(2)}>
          <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{title}</Typography>
        </Grid>
      )}
      {showGeometryNote && isSiteSelected && latestObservationId && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={
              <span>
                <b>{strings.PLEASE_NOTE}</b>{' '}
                {strings.formatString(
                  strings.GEOMETRY_CHANGED_WARNING_MESSAGE,
                  <span>{geometryChangedDate ?? ''}</span>,
                  !isAcceleratorRoute ? (
                    <Link
                      fontSize={'16px'}
                      to={APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', latestObservationId.toString())}
                      target='_blank'
                    >
                      {latestObservationDate ?? ''}
                    </Link>
                  ) : (
                    <Typography fontSize={'16px'} display={'inline'}>
                      {latestObservationDate ?? ''}
                    </Typography>
                  )
                )}
              </span>
            }
            priority='info'
            type='page'
          />
        </Box>
      )}
      {showSurvivalRateMessage && isSiteSelected && (
        <SurvivalRateMessageV2 selectedPlantingSiteId={selectedPlantingSiteId} />
      )}
      {showSelectorCard && (
        <Card radius={'8px'} style={{ 'margin-bottom': '32px' }}>
          <Grid container alignItems={'center'} spacing={4}>
            <Grid item xs={isDesktop ? 3 : 12}>
              {showProjectSelector && (
                <Box marginBottom={1}>
                  <Dropdown
                    placeholder={strings.NO_PROJECT_SELECTED}
                    id='project-selector'
                    onChange={(newValue) =>
                      onSelectProject(newValue === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(newValue))
                    }
                    options={projectOptions}
                    selectedValue={projectId}
                    fullWidth
                  />
                </Box>
              )}
              {singleSiteMode ? (
                <Typography fontSize={'20px'} fontWeight={600}>
                  {plantingSiteOptions[0].label}
                </Typography>
              ) : (
                <>
                  {showAllSitesOption && (
                    <GlobalStyles
                      styles={{
                        '.planting-site-selector-container .options-container li:first-of-type': {
                          borderBottom: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
                        },
                      }}
                    />
                  )}
                  <Dropdown
                    placeholder={strings.SELECT}
                    id='planting-site-selector'
                    onChange={(newValue) =>
                      onSelectPlantingSite(newValue === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(newValue))
                    }
                    options={plantingSiteOptions}
                    selectedValue={selectedPlantingSiteId}
                    fullWidth
                    disabled={isAcceleratorRoute && plantingSiteOptions.length === 0}
                    className='planting-site-selector-container'
                  />
                </>
              )}
            </Grid>
            <Grid item xs={isDesktop ? 3 : 12}>
              <Box>
                <Typography fontWeight={600}>{strings.TOTAL_PLANTING_AREA}</Typography>
                <Typography fontSize='28px' fontWeight={600}>
                  {strings.formatString(strings.X_HA, <FormattedNumber decimals={1} value={displayAreaHa} />)}
                </Typography>
              </Box>
            </Grid>
            {!delayedIsReady ? (
              <CircularProgress sx={{ margin: 'auto' }} />
            ) : (
              <Grid item xs={isDesktop ? 6 : 12}>
                <Typography fontSize='16px' marginTop={theme.spacing(1)}>
                  {headerText}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Card>
      )}
      {plantingSites.length === 0 && !isAcceleratorRoute && !isLoading && delayedIsReady && (
        <PlantsDashboardEmptyMessage />
      )}
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {!delayedIsReady || isLoading ? <CircularProgress sx={{ margin: 'auto' }} /> : <Box>{children}</Box>}
    </Wrapper>
  );
}
