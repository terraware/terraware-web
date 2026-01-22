import React, { type JSX, useEffect, useRef } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import BackToLink from 'src/components/common/BackToLink';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useGetModule from 'src/hooks/useGetModule';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import ContentAndMaterials from './ContentAndMaterials';
import Events from './Events';
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
  hardeningOffQuantity: string;
  activeGrowthQuantity: string;
  readyQuantity: string;
  totalQuantity: string;
  facilityInventories: FacilityName[];
};

export default function ModuleView(): JSX.Element {
  const contentRef = useRef(null);
  const { moduleId } = useParams<{ moduleId: string }>();
  const { module, events, getModule } = useGetModule(Number(moduleId));
  const theme = useTheme();

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
          children: <ContentAndMaterials module={module} deliverables={module?.deliverables ?? []} />,
        },
        {
          id: 'events',
          label: strings.EVENTS,
          children: <Events module={module} events={events} />,
        },
      ]
    : [];

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'details',
    tabs,
    viewIdentifier: 'accelerator-module',
  });

  useEffect(() => {
    getModule();
  }, [getModule]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(4), paddingLeft: theme.spacing(3) }}>
          <Grid container>
            <Grid item xs={12}>
              <BackToLink
                id='back'
                to={APP_PATHS.ACCELERATOR_MODULES}
                name={strings.MODULES}
                style={{ marginBottom: theme.spacing(3) }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography fontSize='24px' fontWeight={600}>
                {module?.name}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </PageHeaderWrapper>
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
          '& .MuiTab-root': {
            textTransform: 'none',
          },
        }}
      >
        {moduleId && <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />}
      </Box>
    </TfMain>
  );
}
