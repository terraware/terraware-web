import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import Card from 'src/components/common/Card';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { useSearchVirtualWalkthroughsQuery } from 'src/queries/search/virtualWalkthroughs';

import VirtualWalkthroughMessages from './VirtualWalkthroughMessages';
import VirtualWalkthroughsMap from './VirtualWalkthroughsMap';
import VirtualWalkthroughsTable from './VirtualWalkthroughsTable';

export default function VirtualWalkthroughsView(): JSX.Element {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();

  const { data: mediaFiles = [] } = useSearchVirtualWalkthroughsQuery(selectedOrganization?.id ?? 0, {
    skip: !selectedOrganization,
  });

  return (
    <TfMain>
      <PageHeader
        back={true}
        backUrl={APP_PATHS.HOME}
        backName={strings.HOME}
        title={strings.VIRTUAL_WALKTHROUGHS}
        subtitle=''
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(3) }}>
        {selectedOrganization && <VirtualWalkthroughMessages organizationId={selectedOrganization.id} />}
        <Box
          sx={{
            background: theme.palette.TwClrBg,
            borderRadius: '8px',
          }}
        >
          <VirtualWalkthroughsMap mediaFiles={mediaFiles} organizationId={selectedOrganization?.id ?? 0} />
        </Box>
        {selectedOrganization && (
          <Card>
            <VirtualWalkthroughsTable mediaFiles={mediaFiles} organizationId={selectedOrganization.id} />
          </Card>
        )}
      </Box>
    </TfMain>
  );
}
