import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';

import VirtualWalkthroughMessages from './VirtualWalkthroughMessages';
import VirtualWalkthroughsMap from './VirtualWalkthroughsMap';
import VirtualWalkthroughsTable from './VirtualWalkthroughsTable';

export default function VirtualWalkthroughsView(): JSX.Element {
  const theme = useTheme();

  // TODO: get these numbers from API
  const processingCount = 0;
  const hasUploadFailed = false;
  const hasUnableToProcess = false;

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
        <VirtualWalkthroughMessages
          processingCount={processingCount}
          hasUploadFailed={hasUploadFailed}
          hasUnableToProcess={hasUnableToProcess}
        />
        <Box
          sx={{
            background: theme.palette.TwClrBg,
            borderRadius: '8px',
            height: '400px',
          }}
        >
          <VirtualWalkthroughsMap />
        </Box>
        <VirtualWalkthroughsTable />
      </Box>
    </TfMain>
  );
}
