import React, { type JSX, useCallback, useState } from 'react';

import { Box, ButtonBase, IconButton, Popover, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import strings from 'src/strings';

export type SiteBoundaryHelpProps = {
  isSimpleSite: boolean;
  onWatchTutorial: () => void;
};

export default function SiteBoundaryHelp({ isSimpleSite, onWatchTutorial }: SiteBoundaryHelpProps): JSX.Element {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const onOpen = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);
  const onClose = useCallback(() => setAnchorEl(null), []);
  const onClickTutorial = useCallback(() => {
    setAnchorEl(null);
    onWatchTutorial();
  }, [onWatchTutorial]);

  return (
    <>
      <ButtonBase
        id='site-boundary-learn-more'
        onClick={onOpen}
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBgSecondary,
          borderRadius: '16px',
          gap: theme.spacing(0.5),
          marginLeft: theme.spacing(0.5),
          padding: theme.spacing(0.25, 1),
          verticalAlign: 'middle',
        }}
      >
        <Icon name='iconIdea' size='small' style={{ fill: theme.palette.TwClrIcnWarning }} />
        <Typography fontSize='14px' fontWeight={500} lineHeight='20px' color={theme.palette.TwClrTxtBrand}>
          {strings.SITE_BOUNDARY_LEARN_MORE}
        </Typography>
      </ButtonBase>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              borderRadius: '8px',
              marginTop: theme.spacing(1),
              maxWidth: '432px',
              padding: theme.spacing(2),
            },
          },
        }}
      >
        <Box display='flex' alignItems='center' gap={theme.spacing(1)} marginBottom={theme.spacing(1.5)}>
          <Icon name='iconIdea' size='small' style={{ fill: theme.palette.TwClrIcnWarning }} />
          <Typography fontSize='16px' fontWeight={600} lineHeight='24px' color={theme.palette.TwClrTxt} flexGrow={1}>
            {strings.SITE_BOUNDARY_ABOUT}
          </Typography>
          <IconButton aria-label={strings.CLOSE} onClick={onClose} size='small'>
            <Icon name='close' size='small' style={{ fill: theme.palette.TwClrIcn }} />
          </IconButton>
        </Box>
        <Typography fontSize='14px' lineHeight='20px' color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1.5)}>
          {isSimpleSite
            ? `${strings.SITE_BOUNDARY_PLANTABLE_AREAS} ${strings.SITE_BOUNDARY_UPLOAD_SIMPLE_SITE_NOTE}`
            : strings.SITE_BOUNDARY_PLANTABLE_AREAS}
        </Typography>
        <Typography fontSize='14px' lineHeight='20px' color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1.5)}>
          {strings.SITE_BOUNDARY_BOUNDING_BOX_LIMIT}
        </Typography>
        <Link onClick={onClickTutorial}>{strings.SITE_BOUNDARY_WATCH_TUTORIAL}</Link>
      </Popover>
    </>
  );
}
