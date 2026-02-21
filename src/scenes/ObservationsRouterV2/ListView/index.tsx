import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Separator, Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
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

  const observableSites = useObservablePlantingSites();
  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list', -1);

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
      <Box display={'flex'} flexDirection={'row'}>
        <Separator height={'40px'} />
        <Typography lineHeight={'40px'} marginRight={theme.spacing(1)}>
          {strings.PLANTING_SITE}
        </Typography>
        <Dropdown
          fullWidth
          required
          selectedValue={selectedPlantingSiteId}
          options={plantingSiteOptions}
          onChange={(value: any) => selectPlantingSite(Number(value))}
        />
      </Box>
    ),
    [selectPlantingSite, plantingSiteOptions, selectedPlantingSiteId, strings, theme]
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

  return (
    <Page
      title={strings.OBSERVATIONS}
      leftComponent={PageHeaderPlantingSiteDropdown}
      rightComponent={scheduleObservationButton}
    >
      <ObservationsEventsNotification />
      {activeTab === 'plantMonitoring' && (
        <SurvivalRateMessageV2
          selectedPlantingSiteId={selectedPlantingSiteId === -1 ? undefined : selectedPlantingSiteId}
        />
      )}
      <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs}>
        <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
          <ObservationMapWrapper
            isBiomass={isBiomass}
            plantingSiteId={selectedPlantingSiteId === -1 ? undefined : selectedPlantingSiteId}
            selectPlantingSiteId={selectPlantingSite}
          />
        </Card>
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
