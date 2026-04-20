import React, { type JSX, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useDocLinks } from 'src/docLinks';
import { useOrganization } from 'src/providers';
import { useSearchOrganizationVirtualWalkthroughsQuery } from 'src/queries/search/organizationVirtualWalkthroughs';
import strings from 'src/strings';

import CreateVirtualWalkthroughStep1Modal from './CreateVirtualWalkthroughStep1Modal';

const VirtualWalkthroughCard = (): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const docLinks = useDocLinks();
  const { selectedOrganization } = useOrganization();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: mediaFiles } = useSearchOrganizationVirtualWalkthroughsQuery(selectedOrganization?.id ?? 0, {
    skip: !selectedOrganization,
  });

  const readyCount = useMemo(() => mediaFiles?.filter((f) => f.splatStatus === 'Ready').length ?? 0, [mediaFiles]);

  const message =
    readyCount === 0 ? (
      <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }}>
        {strings.formatString(
          strings.YOU_CAN_NOW_CREATE_VIRTUAL_WALKTHROUGHS,
          <Link
            to={docLinks.virtual_walkthroughs_videos_tips}
            fontSize='16px'
            fontWeight={400}
            target='_blank'
            style={{ display: 'inline' }}
          >
            {strings.KNOWLEDGE_BASE}
          </Link>
        )}
      </Typography>
    ) : (
      <>
        <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }}>
          {strings.formatString(strings.YOU_HAVE_X_VIRTUAL_WALKTHROUGHS, readyCount)}
        </Typography>
        <Link to={APP_PATHS.OBSERVATIONS} fontSize='16px' fontWeight={400}>
          {strings.VIEW_IN_MAP}
        </Link>
      </>
    );

  return (
    <>
      <CreateVirtualWalkthroughStep1Modal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Box
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBg,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          padding: '16px 24px',
          gap: '16px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>{message}</Box>

        <Button
          label={strings.CREATE_VIRTUAL_WALKTHROUGH}
          onClick={() => setModalOpen(true)}
          priority='secondary'
          style={{ whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}
          type='productive'
        />
      </Box>
    </>
  );
};

export default VirtualWalkthroughCard;
