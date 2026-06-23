import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Separator, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import SurvivalRateRecalculationMessage from 'src/components/SurvivalRate/SurvivalRateRecalculationMessage';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useStickyPlantingSiteId, { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import useSurvivalRateCalculationInProgress from 'src/hooks/useSurvivalRateCalculationInProgress';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyCountObservationsQuery } from 'src/queries/search/observations';
import MobileAppCard from 'src/scenes/Home/MobileAppCard';
import { isAdmin } from 'src/utils/organization';
import useStickyTabs from 'src/utils/useStickyTabs';

import ObservationMapWrapper from '../Map';
import useObservablePlantingSites from '../Schedule/useObservablePlantingSites';
import BiomassList from './BiomassList';
import ObservationsEventsNotification from './ObservationsEventsNotification';
import PlantMonitoringList from './PlantMonitoringList';

const ObservationListView = (): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const observableSites = useObservablePlantingSites();
  const { plantingSites } = useOrganizationPlantingSites();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list');

  // The data layer treats `undefined` as "all planting sites", so translate the selection for queries.
  const plantingSiteIdFilter = selectedPlantingSiteId === ALL_PLANTING_SITES ? undefined : selectedPlantingSiteId;

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

    const allSiteOptions =
      plantingSites.length > 1
        ? [
            {
              label: strings.ALL_PLANTING_SITES,
              value: ALL_PLANTING_SITES,
            },
          ]
        : [];

    return [...allSiteOptions, ...sitesOptions];
  }, [plantingSites, strings]);

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
        children: <PlantMonitoringList plantingSiteId={selectedPlantingSiteId} />,
      },
      {
        id: 'biomassMeasurements',
        label: strings.BIOMASS_MONITORING,
        children: <BiomassList plantingSiteId={selectedPlantingSiteId} />,
      },
    ],
    [selectedPlantingSiteId, strings.BIOMASS_MONITORING, strings.PLANT_MONITORING]
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

  useEffect(() => {
    if (selectedOrganization) {
      if (activeTab === 'biomassMeasurements') {
        void countObservations(
          {
            organizationId: selectedOrganization.id,
            observationType: 'Biomass Measurements',
            plantingSiteId: plantingSiteIdFilter,
            state: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
          },
          true
        );
      } else if (activeTab === 'plantMonitoring') {
        void countObservations(
          {
            organizationId: selectedOrganization.id,
            observationType: 'Monitoring',
            plantingSiteId: plantingSiteIdFilter,
            state: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
          },
          true
        );
      }
    }
  }, [activeTab, countObservations, selectedOrganization, plantingSiteIdFilter]);

  return (
    <Page
      title={isMobile ? strings.OBSERVATIONS : PageHeaderPlantingSiteDropdown}
      rightComponent={scheduleObservationButton}
      leftComponent={isMobile ? PageHeaderPlantingSiteDropdown : undefined}
      leftComponentGridSize={isMobile ? 7 : 0}
      rightComponentGridSize={4}
    >
      <ObservationsEventsNotification />
      {activeTab === 'plantMonitoring' && (
        <>
          <SurvivalRateMessageV2 selectedPlantingSiteId={plantingSiteIdFilter} />
          <SurvivalRateRecalculationMessage inProgress={survivalRateRecalculationInProgress} />
        </>
      )}
      <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs}>
        {hasObservationsResults && (
          <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
            <ObservationMapWrapper
              isBiomass={isBiomass}
              plantingSiteId={plantingSiteIdFilter}
              selectPlantingSiteId={selectPlantingSite}
            />
          </Card>
        )}
      </Tabs>
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
    </Page>
  );
};

export default ObservationListView;
