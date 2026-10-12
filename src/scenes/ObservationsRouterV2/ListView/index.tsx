import React, { type JSX, useEffect, useMemo, useRef } from 'react';
import { useMatch, useSearchParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useStickyPlantingSiteId, { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import MobileAppCard from 'src/scenes/Home/MobileAppCard';
import { isAdmin } from 'src/utils/organization';

import ObservationMapWrapper from '../Map';
import ObservationFiltersProvider, { PlotType, useObservationFilters } from '../ObservationFiltersProvider';
import useObservablePlantingSites from '../Schedule/useObservablePlantingSites';
import SelectedObservationProvider from '../SelectedObservationProvider';
import useFilteredObservationResults from '../useFilteredObservationResults';
import AdHocObservationsList from './AdHocObservationsList';
import ObservationFilters from './ObservationFilters';
import PlantMonitoringList from './PlantMonitoringList';
import ScheduledObservationsMenu from './ScheduledObservations';
import SurvivalRateSettingsMenu from './SurvivalRateSettingsMenu';

const ObservationListViewContent = (): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { isDesktop, isMobile } = useDeviceInfo();

  const { observationType, plotType, viewMode } = useObservationFilters();

  const observableSites = useObservablePlantingSites();
  const { plantingSites, isSuccess: plantingSitesLoaded } = useOrganizationPlantingSites();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list');

  // The data layer treats `undefined` as "all planting sites", so translate the selection for queries.
  const [searchParams, setSearchParams] = useSearchParams();
  const isListRoute = useMatch(APP_PATHS.OBSERVATIONS) !== null;
  const plantingSiteIdParam = searchParams.get('plantingSiteId');

  const plantingSiteIdFilter = selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId;
  const showAllSitesOption = plantingSites.length > 1;

  const lastParamRef = useRef<string | null>(null);
  useEffect(() => {
    if (!plantingSitesLoaded || !isListRoute) {
      return;
    }

    const paramChangedExternally = plantingSiteIdParam !== lastParamRef.current;
    lastParamRef.current = plantingSiteIdParam;

    if (paramChangedExternally && plantingSiteIdParam) {
      if (plantingSiteIdParam === ALL_PLANTING_SITES && showAllSitesOption) {
        if (selectedPlantingSiteId !== ALL_PLANTING_SITES) {
          selectPlantingSite(ALL_PLANTING_SITES);
        }
        return;
      }
      const paramId = Number(plantingSiteIdParam);
      const isSiteInOrg = !isNaN(paramId) && plantingSites.some((site) => site.id === paramId);
      if (isSiteInOrg) {
        if (paramId !== selectedPlantingSiteId) {
          selectPlantingSite(paramId);
        }
        return;
      }
    }

    // Single-site orgs should defaut to that site instead of all sites
    const isSelectedSiteInOrg = plantingSites.some((site) => site.id === selectedPlantingSiteId);
    const isSelectionValid = showAllSitesOption
      ? selectedPlantingSiteId === ALL_PLANTING_SITES || isSelectedSiteInOrg
      : isSelectedSiteInOrg;
    if (!isSelectionValid) {
      const fallback: PlantingSiteId | undefined = showAllSitesOption ? ALL_PLANTING_SITES : plantingSites[0]?.id;
      if (fallback !== undefined && fallback !== selectedPlantingSiteId) {
        selectPlantingSite(fallback);
        return;
      }
    }

    const desiredParam =
      typeof selectedPlantingSiteId === 'number' ? selectedPlantingSiteId.toString() : ALL_PLANTING_SITES;
    if (plantingSiteIdParam !== desiredParam) {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          params.set('plantingSiteId', desiredParam);
          return params;
        },
        { replace: true }
      );
    }
  }, [
    isListRoute,
    plantingSitesLoaded,
    plantingSites,
    setSearchParams,
    selectedPlantingSiteId,
    plantingSiteIdParam,
    selectPlantingSite,
    showAllSitesOption,
  ]);

  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    const sitesOptions = plantingSites
      .map((site) => ({
        label: site.name,
        value: site.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const allSiteOptions = showAllSitesOption
      ? [
          {
            label: strings.ALL_PLANTING_SITES,
            value: ALL_PLANTING_SITES,
          },
        ]
      : [];

    return [...allSiteOptions, ...sitesOptions];
  }, [plantingSites, showAllSitesOption, strings]);

  const plantingSiteSelector = useMemo(
    () => (
      <Dropdown
        fullWidth
        id='planting-site-selector'
        onChange={(value: string) =>
          selectPlantingSite(value === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(value))
        }
        options={plantingSiteOptions}
        required
        selectedValue={selectedPlantingSiteId}
        sx={isMobile ? undefined : { flex: '1 1 180px', maxWidth: '240px', minWidth: '180px' }}
      />
    ),
    [isMobile, plantingSiteOptions, selectPlantingSite, selectedPlantingSiteId]
  );

  const scheduleObservationEnabled = useMemo(
    () => observableSites && isAdmin(selectedOrganization),
    [observableSites, selectedOrganization]
  );

  const scheduleObservationButton = useMemo(() => {
    if (scheduleObservationEnabled) {
      return (
        <Button
          id={'schedule-observation'}
          label={strings.SCHEDULE_OBSERVATION}
          onClick={() =>
            navigate(
              typeof selectedPlantingSiteId === 'number'
                ? `${APP_PATHS.SCHEDULE_OBSERVATION}?plantingSiteId=${selectedPlantingSiteId}`
                : APP_PATHS.SCHEDULE_OBSERVATION
            )
          }
          size='medium'
          sx={{ '&.button': { margin: 0 }, flex: isMobile ? '1 0 auto' : undefined, whiteSpace: 'nowrap' }}
        />
      );
    } else {
      return undefined;
    }
  }, [isMobile, navigate, scheduleObservationEnabled, selectedPlantingSiteId, strings.SCHEDULE_OBSERVATION]);

  const headerActions = useMemo(
    () => (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme.spacing(2),
          justifyContent: isDesktop ? 'flex-end' : 'flex-start',
        }}
      >
        {scheduleObservationButton}
        <Box sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(2) }}>
          <ScheduledObservationsMenu
            canReschedule={isAdmin(selectedOrganization)}
            plantingSiteId={selectedPlantingSiteId}
          />
          {typeof selectedPlantingSiteId === 'number' && (
            <SurvivalRateSettingsMenu plantingSiteId={selectedPlantingSiteId} />
          )}
        </Box>
      </Box>
    ),
    [isDesktop, scheduleObservationButton, selectedOrganization, selectedPlantingSiteId, theme]
  );

  const countedPlotType: PlotType = observationType === 'Biomass Measurements' ? 'adHoc' : plotType;

  const { emptyState } = useFilteredObservationResults({
    observationType,
    plantingSiteId: selectedPlantingSiteId,
    plotType: countedPlotType,
  });

  const observationMapCard = useMemo(
    () => (
      <Card
        radius={'8px'}
        style={{
          marginBottom: theme.spacing(3),
          paddingTop: theme.spacing(1),
          width: '100%',
        }}
      >
        <ObservationMapWrapper
          emptyState={emptyState}
          observationType={observationType}
          plantingSiteId={plantingSiteIdFilter}
          plotType={countedPlotType}
          selectPlantingSiteId={selectPlantingSite}
        />
      </Card>
    ),
    [countedPlotType, emptyState, observationType, plantingSiteIdFilter, selectPlantingSite, theme]
  );

  const mobileAppCard = useMemo(
    () => (
      <Box marginTop={'24px'} width={'100%'}>
        <MobileAppCard
          description={strings.OBSERVATIONS_TERRAWARE_MOBILE_APP_DESCRIPTION}
          imageAlt={strings.TERRAWARE_MOBILE_APP_IMAGE_ALT}
          imageSource='/assets/terraware-mobile-app.svg'
          padding='32px'
          title={strings.DOWNLOAD_THE_TERRAWARE_MOBILE_APP}
          allowDismiss
          dismissPreferenceId='dismissObservationsMobileAppCard'
        />
      </Box>
    ),
    [strings]
  );

  return (
    <Page
      collapsibleHeader
      rightComponent={headerActions}
      stickyHeader
      subHeader={
        <ObservationFilters plantingSiteId={selectedPlantingSiteId} plantingSiteSelector={plantingSiteSelector} />
      }
      title={strings.OBSERVATIONS}
    >
      {viewMode !== 'list' && observationMapCard}
      {viewMode !== 'map' &&
        (plotType === 'adHoc' ? (
          <AdHocObservationsList plantingSiteId={selectedPlantingSiteId} />
        ) : (
          <PlantMonitoringList plantingSiteId={selectedPlantingSiteId} />
        ))}
      {mobileAppCard}
    </Page>
  );
};

const ObservationListView = (): JSX.Element => (
  <ObservationFiltersProvider>
    <SelectedObservationProvider>
      <ObservationListViewContent />
    </SelectedObservationProvider>
  </ObservationFiltersProvider>
);

export default ObservationListView;
