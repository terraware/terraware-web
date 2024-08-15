import React from 'react';

import { Grid, useTheme } from '@mui/material';

import Page, { PageProps } from 'src/components/Page';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ModuleTimeline from './ModuleTimeline';

const PageWithModuleTimeline = (props: PageProps) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { contentStyle, titleStyle, titleContainerStyle } = props;

  const desktopContainerStyles = {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: theme.spacing(2),
  };

  return (
    <Grid container spacing={theme.spacing(0)} paddingRight={'24px'}>
      <Grid
        item
        sx={{
          maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: 'calc(100% - 206px)', xl: 'calc(100% - 206px)' },
          width: '100%',
        }}
      >
        <Page
          {...props}
          containerStyles={isMobile ? {} : desktopContainerStyles}
          contentStyle={contentStyle}
          titleStyle={titleStyle}
          titleContainerStyle={titleContainerStyle}
        />
      </Grid>
      <Grid item sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', xl: 'block' } }} minWidth={'206px'}>
        <ModuleTimeline />
      </Grid>
    </Grid>
  );
};

export default PageWithModuleTimeline;
