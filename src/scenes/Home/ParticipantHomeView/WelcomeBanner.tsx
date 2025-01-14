import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import DialogCloseButton from 'src/components/common/DialogCloseButton';
import strings from 'src/strings';

interface WelcomeBannerProps {
  onClose: () => void;
}

const WelcomeBanner = ({ onClose }: WelcomeBannerProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        borderRadius: theme.spacing(2),
        border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
        padding: theme.spacing(2),
        position: 'relative',
      }}
    >
      <Grid container columnSpacing={theme.spacing(2)} paddingRight={0} justifyContent={'flex-start'}>
        <Grid item xs={2}>
          <img
            src='/assets/accelerator-trees.svg'
            // TODO this might change
            alt={strings.ACCELERATOR_WELCOME_ALT}
            width='100%'
            height='100px'
            style={{
              objectFit: 'scale-down',
              objectPosition: '0% 50%',
            }}
          />
        </Grid>
        <Grid item xs={9}>
          <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
            {strings.ACCELERATOR_WELCOME_HEADER}
          </Typography>
          <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
            {strings.ACCELERATOR_WELCOME_CONTENT}
          </Typography>
        </Grid>

        <DialogCloseButton
          onClick={onClose}
          sx={{
            color: theme.palette.TwClrIcn,
            margin: 0,
            padding: theme.spacing(2),
            right: 0,
            top: 0,
          }}
        />
      </Grid>
    </Box>
  );
};

export default WelcomeBanner;
