import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Separator, Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazySearchPlantingSitesQuery } from 'src/queries/search/plantingSites';
import MobileAppCard from 'src/scenes/Home/MobileAppCard';
import useStickyTabs from 'src/utils/useStickyTabs';

import BiomassList from './BiomassList';
import ObservationMap from './ObservationMap';
import PlantMonitoringList from './PlantMonitoringList';

const ObservationListView = (): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const theme = useTheme();

  const [listPlantingSites, listPlantingSitesResult] = useLazySearchPlantingSitesQuery();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list');

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, searchOrder: [{ field: 'name' }] }, true);
    }
  }, [listPlantingSites, selectedOrganization]);

  const plantingSites = useMemo(() => listPlantingSitesResult.data ?? [], [listPlantingSitesResult.data]);
  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    const sitesOptions = plantingSites.map((site) => ({
      label: site.name,
      value: site.id,
    }));

    const allSiteOptions =
      plantingSites.length > 1
        ? [
            {
              label: strings.ALL_PLANTING_SITES,
              value: undefined,
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
          onChange={(newValue: string) => selectPlantingSite(Number(newValue))}
        />
      </Box>
    ),
    [plantingSiteOptions, selectPlantingSite, selectedPlantingSiteId, strings, theme]
  );

  const tabs = useMemo(() => {
    return [
      {
        id: 'plantMonitoring',
        label: strings.PLANT_MONITORING,
        children: <PlantMonitoringList />,
      },
      {
        id: 'biomassMeasurements',
        label: strings.BIOMASS_MONITORING,
        children: <BiomassList siteId={selectedPlantingSiteId} />,
      },
    ];
  }, [selectedPlantingSiteId, strings.BIOMASS_MONITORING, strings.PLANT_MONITORING]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'plantMonitoring',
    tabs,
    viewIdentifier: 'observations',
  });

  return (
    <Page title={strings.OBSERVATIONS} leftComponent={PageHeaderPlantingSiteDropdown}>
      <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs}>
        <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
          <ObservationMap />
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
