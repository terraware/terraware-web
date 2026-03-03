import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Separator, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
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
  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list', -1);

  const [countObservations, countObservationsResult] = useLazyCountObservationsQuery();
  const hasObservationsResults = useMemo(() => !!countObservationsResult.data, [countObservationsResult]);

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full: false }, true);
    }
  }, [listPlantingSites, selectedOrganization]);

  const plantingSites = useMemo(() => listPlantingSitesResult.data?.sites ?? [], [listPlantingSitesResult.data]);
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
              value: -1,
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
          onChange={(value: any) => selectPlantingSite(Number(value))}
          sx={{ flex: 1, maxWidth: '400px' }}
        />
      </Box>
    ),
    [isMobile, strings, theme, selectedPlantingSiteId, plantingSiteOptions, selectPlantingSite]
  );

  const tabs = useMemo(() => {
    const siteId = selectedPlantingSiteId === -1 ? undefined : selectedPlantingSiteId;
    return [
      {
        id: 'plantMonitoring',
        label: strings.PLANT_MONITORING,
        children: <PlantMonitoringList plantingSiteId={siteId} />,
      },
      {
        id: 'biomassMeasurements',
        label: strings.BIOMASS_MONITORING,
        children: <BiomassList plantingSiteId={siteId} />,
      },
    ];
  }, [selectedPlantingSiteId, strings.BIOMASS_MONITORING, strings.PLANT_MONITORING]);

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
    const siteId = selectedPlantingSiteId === -1 ? undefined : selectedPlantingSiteId;
    if (selectedOrganization) {
      if (activeTab === 'biomassMeasurements') {
        void countObservations(
          {
            organizationId: selectedOrganization.id,
            observationType: 'Biomass Measurements',
            plantingSiteId: siteId,
            state: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
          },
          true
        );
      } else if (activeTab === 'plantMonitoring') {
        void countObservations(
          {
            organizationId: selectedOrganization.id,
            observationType: 'Monitoring',
            plantingSiteId: siteId,
            state: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
          },
          true
        );
      }
    }
  }, [activeTab, countObservations, selectedOrganization, selectedPlantingSiteId]);

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
        <SurvivalRateMessageV2
          selectedPlantingSiteId={selectedPlantingSiteId === -1 ? undefined : selectedPlantingSiteId}
        />
      )}
      <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs}>
        {hasObservationsResults && (
          <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
            <ObservationMapWrapper
              isBiomass={isBiomass}
              plantingSiteId={selectedPlantingSiteId === -1 ? undefined : selectedPlantingSiteId}
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
