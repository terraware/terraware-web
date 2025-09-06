import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

type ActivityLogMapSplitViewProps = {
  children: React.ReactNode;
  topComponent?: React.ReactNode;
};

export default function ActivityLogMapSplitView({ children, topComponent }: ActivityLogMapSplitViewProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <Grid container>
        <Grid item xs={6} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box
            display='flex'
            sx={{
              backgroundColor: 'darkGray',
              borderRadius: theme.spacing(1),
              minHeight: '500px',
              padding: theme.spacing(2),
            }}
          >
            <Typography>TODO: Render map</Typography>
          </Box>
        </Grid>

        <Grid item textAlign='left' xs={12} md={6}>
          {children}
        </Grid>
      </Grid>
    </Box>
  );
}
