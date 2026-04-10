import React, { type JSX, useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';

type VirtualWalkthroughCardProps = {
  count?: number;
};

const VirtualWalkthroughCard = ({ count = 0 }: VirtualWalkthroughCardProps): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const handleCreateClick = useCallback(() => {
    navigate(APP_PATHS.OBSERVATIONS);
  }, [navigate]);

  return (
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Typography
          sx={{
            color: theme.palette.TwClrTxt,
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
          }}
        >
          {strings.formatString(strings.YOU_HAVE_X_VIRTUAL_WALKTHROUGHS, count)}
        </Typography>
        <Link to={APP_PATHS.OBSERVATIONS} fontSize='16px' fontWeight={400}>
          {strings.VIEW_IN_MAP}
        </Link>
      </Box>

      <Button
        label={strings.CREATE_VIRTUAL_WALKTHROUGH}
        onClick={handleCreateClick}
        priority='secondary'
        style={{ whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}
        type='productive'
      />
    </Box>
  );
};

export default VirtualWalkthroughCard;
