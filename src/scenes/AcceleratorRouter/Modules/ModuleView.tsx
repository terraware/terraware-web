import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import CommonTitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useGetModule from 'src/hooks/useGetModule';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import ContentAndMaterials from './ContentAndMaterials';
import ModuleDetails from './ModuleDetails';

export const InventoryListTypes: Record<string, string> = {
  BATCHES_BY_SPECIES: 'batches_by_species',
  BATCHES_BY_NURSERY: 'batches_by_nursery',
  BATCHES_BY_BATCH: 'batches_by_batch',
} as const;

type InventoryListTypeKeys = keyof typeof InventoryListTypes;
export type InventoryListType = (typeof InventoryListTypes)[InventoryListTypeKeys];

export type FacilityName = {
  facility_name: string;
};
export type InventoryResult = {
  facility_id: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  germinatingQuantity: string;
  notReadyQuantity: string;
  readyQuantity: string;
  totalQuantity: string;
  facilityInventories: FacilityName[];
};

export default function ModuleView(): JSX.Element {
  const { activeLocale } = useLocalization();
  const contentRef = useRef(null);
  const { moduleId } = useParams<{ moduleId: string }>();
  const { getModule, module, deliverables } = useGetModule();

  useEffect(() => {
    if (moduleId) {
      getModule({ moduleId: Number(moduleId) });
    }
  }, [moduleId]);

  const tabs = moduleId
    ? [
        {
          id: 'details',
          label: strings.DETAILS,
          children: <ModuleDetails module={module} moduleId={moduleId} />,
        },
        {
          id: 'contentAndMaterials',
          label: strings.CONTENT_AND_MATERIALS,
          children: <ContentAndMaterials module={module} deliverables={deliverables} />,
        },
        {
          id: 'events',
          label: strings.EVENTS,
          children: <p>events</p>,
        },
      ]
    : [];

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'details',
    tabs,
    viewIdentifier: 'accelerator-module-view',
  });

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.MODULES : '',
        to: APP_PATHS.ACCELERATOR_MODULES,
      },
    ],
    [activeLocale]
  );

  return (
    <Page crumbs={crumbs} title={<CommonTitleBar title={module?.name} />}>
      <Box
        ref={contentRef}
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
        {moduleId && <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />}
      </Box>
    </Page>
  );
}
