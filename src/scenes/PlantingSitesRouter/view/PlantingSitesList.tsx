import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Button, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyCountDraftPlantingSitesQuery } from 'src/queries/search/draftPlantingSites';
import { useLazyCountPlantingSitesQuery } from 'src/queries/search/plantingSites';
import useQuery from 'src/utils/useQuery';
import useStickyTabs from 'src/utils/useStickyTabs';

import PlantingSiteTypeSelect from '../edit/PlantingSiteTypeSelect';
import PlantingSitesListTab from './PlantingSitesListTab';

const ApplicationListView = () => {
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const query = useQuery();
  const { selectedOrganization } = useOrganization();
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);

  const [countSites, { data: sitesCount, isLoading: sitesCountLoading }] = useLazyCountPlantingSitesQuery();
  const [countDraftSites, { data: draftSitesCount, isLoading: draftSitesCountLoading }] =
    useLazyCountDraftPlantingSitesQuery();

  useEffect(() => {
    if (selectedOrganization) {
      void countSites(selectedOrganization.id, true);
      void countDraftSites(selectedOrganization.id, true);
    }
  }, [countDraftSites, countSites, selectedOrganization]);

  useEffect(() => {
    if (query.get('new')) {
      setPlantingSiteTypeSelectOpen(true);
    }
  }, [query]);

  const tabs = useMemo(() => {
    return [
      {
        id: 'plantingSites',
        label: strings.PLANTING_SITES,
        children: <PlantingSitesListTab isDraft={false} />,
      },
      {
        id: 'draftPlantingSites',
        label: strings.DRAFT_PLANTING_SITES,
        children: <PlantingSitesListTab isDraft />,
      },
    ];
  }, [strings]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'plantingSites',
    tabs,
    viewIdentifier: 'planting-sites',
  });

  const rightComponent = useMemo(() => {
    if (isMobile) {
      return (
        <Button id='new-planting-site' icon='plus' onClick={() => setPlantingSiteTypeSelectOpen(true)} size='medium' />
      );
    } else {
      return (
        <Button
          id='new-planting-site'
          icon='plus'
          label={strings.ADD_PLANTING_SITE}
          onClick={() => setPlantingSiteTypeSelectOpen(true)}
          size='medium'
        />
      );
    }
  }, [isMobile, strings]);

  const isLoading = useMemo(() => {
    return sitesCountLoading || draftSitesCountLoading;
  }, [draftSitesCountLoading, sitesCountLoading]);

  const hasSites = useMemo(() => {
    return (sitesCount ?? 0) + (draftSitesCount ?? 0) > 0;
  }, [draftSitesCount, sitesCount]);

  if (!isLoading && !hasSites) {
    return <EmptyStatePage pageName={'PlantingSites'} />;
  }

  return (
    <Page title={strings.PLANTING_SITES} contentStyle={{ display: 'block' }} rightComponent={rightComponent}>
      {plantingSiteTypeSelectOpen && <PlantingSiteTypeSelect onClose={() => setPlantingSiteTypeSelectOpen(false)} />}
      <Box
        display='flex'
        flexDirection='column'
        flexGrow={1}
        sx={{
          '& .MuiTabPanel-root[hidden]': {
            flexGrow: 0,
          },
          '& .MuiTabPanel-root': {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          },
          '& >.MuiBox-root': {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          },
        }}
      >
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default ApplicationListView;
