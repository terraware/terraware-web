import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import useDeviceInfo from 'src/utils/useDeviceInfo';

type MapSplitViewProps = {
  children: React.ReactNode;
  topComponent?: React.ReactNode;
};

export default function MapSplitView({ children, topComponent }: MapSplitViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <Grid container>
        {!isMobile && (
          <Grid item xs={6}>
            <Box
              display='flex'
              sx={{
                alignItems: 'center',
                backgroundColor: 'darkGray',
                borderRadius: theme.spacing(1),
                justifyContent: 'center',
                marginRight: theme.spacing(2),
                minHeight: '500px',
                padding: theme.spacing(2),
              }}
            >
              <Typography>TODO: Render map</Typography>
            </Box>
          </Grid>
        )}

        <Grid item textAlign='left' xs={isMobile ? 12 : 6}>
          {children}
        </Grid>
      </Grid>
    </Box>
  );
}
