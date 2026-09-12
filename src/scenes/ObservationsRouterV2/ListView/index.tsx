import React, { type JSX, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Separator, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import SurvivalRateRecalculationMessage from 'src/components/SurvivalRate/SurvivalRateRecalculationMessage';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useStickyPlantingSiteId, { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import useSurvivalRateCalculationInProgress from 'src/hooks/useSurvivalRateCalculationInProgress';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyCountObservationsQuery } from 'src/queries/search/observations';
import MobileAppCard from 'src/scenes/Home/MobileAppCard';
import { isAdmin } from 'src/utils/organization';
import useStickyTabs from 'src/utils/useStickyTabs';

import ObservationMapWrapper from '../Map';
import useObservablePlantingSites from '../Schedule/useObservablePlantingSites';
import useObservationFilters from '../useObservationFilters';
import BiomassList from './BiomassList';
import ObservationFilters from './ObservationFilters';
import ObservationsEventsNotification from './ObservationsEventsNotification';
import PlantMonitoringList from './PlantMonitoringList';

const ObservationListView = (): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const newFiltersEnabled = isEnabled('New Observation Filters');

  const { observationType, plotType, setObservationType, setPlotType } = useObservationFilters();

  const observableSites = useObservablePlantingSites();
  const { plantingSites, isSuccess: plantingSitesLoaded } = useOrganizationPlantingSites();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list');

  // The data layer treats `undefined` as "all planting sites", so translate the selection for queries.
  const [searchParams, setSearchParams] = useSearchParams();
  const plantingSiteIdParam = searchParams.get('plantingSiteId');

  const plantingSiteIdFilter = selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId;
  const showAllSitesOption = plantingSites.length > 1;

  const lastParamRef = useRef<string | null>(null);
  useEffect(() => {
    if (!plantingSitesLoaded) {
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
      const params = new URLSearchParams(searchParams);
      params.set('plantingSiteId', desiredParam);
      setSearchParams(params, { replace: true });
    }
  }, [
    plantingSitesLoaded,
    plantingSites,
    searchParams,
    setSearchParams,
    selectedPlantingSiteId,
    plantingSiteIdParam,
    selectPlantingSite,
    showAllSitesOption,
  ]);

  // Poll for survival rate recalculation and refresh observation results when it completes.
  const { inProgress: survivalRateRecalculationInProgress } =
    useSurvivalRateCalculationInProgress(plantingSiteIdFilter);

  const [countObservations, countObservationsResult] = useLazyCountObservationsQuery();
  const hasObservationsResults = useMemo(() => !!countObservationsResult.data, [countObservationsResult]);

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

  const PageHeaderPlantingSiteDropdown = useMemo(
    () => (
      <Box sx={{ alignItems: 'center', display: 'flex', width: '100%' }}>
        {!isMobile && (
          <Typography fontSize='24px' fontWeight='600' paddingLeft={'24px'}>
            {strings.OBSERVATIONS}
          </Typography>
        )}
        <Separator height={'40px'} />
        <Typography lineHeight={'40px'} marginRight={theme.spacing(1)} whiteSpace={'nowrap'}>
          {strings.PLANTING_SITE}
        </Typography>
        <Dropdown
          fullWidth
          required
          selectedValue={selectedPlantingSiteId}
          options={plantingSiteOptions}
          onChange={(value: string) =>
            selectPlantingSite(value === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(value))
          }
          sx={{ flex: 1, maxWidth: '400px' }}
        />
      </Box>
    ),
    [isMobile, strings, theme, selectedPlantingSiteId, plantingSiteOptions, selectPlantingSite]
  );

  const tabs = useMemo(
    () => [
      {
        id: 'plantMonitoring',
        label: strings.PLANT_MONITORING,
        children: (
          <PlantMonitoringList
            onPlotTypeChange={setPlotType}
            plantingSiteId={selectedPlantingSiteId}
            plotType={plotType}
          />
        ),
      },
      {
        id: 'biomassMeasurements',
        label: strings.BIOMASS_MONITORING,
        children: <BiomassList plantingSiteId={selectedPlantingSiteId} />,
      },
    ],
    [plotType, selectedPlantingSiteId, setPlotType, strings.BIOMASS_MONITORING, strings.PLANT_MONITORING]
  );

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'plantMonitoring',
    tabs,
    viewIdentifier: 'observations',
  });

  const isBiomass = useMemo(() => activeTab === 'biomassMeasurements', [activeTab]);
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
          onClick={() => navigate(APP_PATHS.SCHEDULE_OBSERVATION)}
          size='medium'
        />
      );
    } else {
      return undefined;
    }
  }, [navigate, scheduleObservationEnabled, strings.SCHEDULE_OBSERVATION]);

  const countedObservationType = newFiltersEnabled
    ? observationType
    : isBiomass
      ? 'Biomass Measurements'
      : 'Monitoring';

  useEffect(() => {
    if (selectedOrganization) {
      void countObservations(
        {
          organizationId: selectedOrganization.id,
          observationType: countedObservationType,
          plantingSiteId: plantingSiteIdFilter,
          state: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
        },
        true
      );
    }
  }, [countObservations, countedObservationType, selectedOrganization, plantingSiteIdFilter]);

  // Biomass measurements only ever come from ad-hoc plots.
  const mappedPlotType = countedObservationType === 'Biomass Measurements' ? 'adHoc' : plotType;

  const observationMapCard = useMemo(
    () =>
      hasObservationsResults && (
        <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
          <ObservationMapWrapper
            observationType={countedObservationType}
            plantingSiteId={plantingSiteIdFilter}
            plotType={mappedPlotType}
            selectPlantingSiteId={selectPlantingSite}
          />
        </Card>
      ),
    [countedObservationType, hasObservationsResults, mappedPlotType, plantingSiteIdFilter, selectPlantingSite, theme]
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

  const survivalRateMessages = useMemo(
    () =>
      countedObservationType === 'Monitoring' && (
        <>
          <SurvivalRateMessageV2 selectedPlantingSiteId={plantingSiteIdFilter} />
          <SurvivalRateRecalculationMessage inProgress={survivalRateRecalculationInProgress} />
        </>
      ),
    [countedObservationType, plantingSiteIdFilter, survivalRateRecalculationInProgress]
  );

  if (newFiltersEnabled) {
    return (
      <Page
        rightComponent={scheduleObservationButton}
        stickyHeader
        subHeader={
          <ObservationFilters
            observationType={observationType}
            onObservationTypeChange={setObservationType}
            onPlantingSiteChange={selectPlantingSite}
            onPlotTypeChange={setPlotType}
            plantingSiteId={selectedPlantingSiteId}
            plantingSiteOptions={plantingSiteOptions}
            plotType={plotType}
          />
        }
        title={strings.OBSERVATIONS}
      >
        <ObservationsEventsNotification />
        {survivalRateMessages}
        {observationMapCard}
        {observationType === 'Biomass Measurements' ? (
          <BiomassList plantingSiteId={selectedPlantingSiteId} />
        ) : (
          <PlantMonitoringList plantingSiteId={selectedPlantingSiteId} plotType={plotType} />
        )}
        {mobileAppCard}
      </Page>
    );
  }

  return (
    <Page
      title={isMobile ? strings.OBSERVATIONS : PageHeaderPlantingSiteDropdown}
      rightComponent={scheduleObservationButton}
      leftComponent={isMobile ? PageHeaderPlantingSiteDropdown : undefined}
      leftComponentGridSize={isMobile ? 7 : 0}
      rightComponentGridSize={4}
    >
      <ObservationsEventsNotification />
      {survivalRateMessages}
      <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs}>
        {observationMapCard}
      </Tabs>
      {mobileAppCard}
    </Page>
  );
};

export default ObservationListView;
