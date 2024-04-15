import React from 'react';

import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import Close from '@terraware/web-components/components/svg/Close';

import DialogCloseButton from 'src/components/common/DialogCloseButton';

const WelcomeBanner = () => {
  const theme = useTheme();

  const handleOnClick = () => {
    // tslint:disable:no-console
    console.log('close');
  };

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
      <Grid container columnSpacing={theme.spacing(1)}>
        <Grid item xs={3}>
          <img
            src='https://source.unsplash.com/random/160x100/?cat'
            alt='a kitten'
            style={{ width: '100%', maxHeight: '200px' }}
          />
        </Grid>
        <Grid item xs={8}>
          <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
            Welcome to your Accelerator Program Experience!
          </Typography>
          <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'}>
            This will serve as your source of information for the Terraformation accelerator program. Review your To Do
            list below to see the tasks you need to review and complete before their due dates. See all of your tasks
            for the current phase by clicking Deliverables in the left menu.
          </Typography>
        </Grid>

        <DialogCloseButton
          onClick={handleOnClick}
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
