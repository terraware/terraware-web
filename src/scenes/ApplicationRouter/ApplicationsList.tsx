import React from 'react';

import { Box, Container, Grid } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import ApplicationCard from 'src/components/Application/ApplicationCard';
import PageHeader from 'src/components/PageHeader';
import strings from 'src/strings';

const ApplicationListView = () => {
  const { isTablet, isMobile } = useDeviceInfo();

  const applications = [
    {
      applicationId: 1,
      applicationName: 'Andromeda',
      completed: false,
      dateStarted: DateTime.fromJSDate(new Date('2024-07-10')),
      statusText: 'Pre-screen in progress',
    },
    {
      applicationId: 2,
      applicationName: 'Cassiopeia',
      completed: false,
      dateStarted: DateTime.fromJSDate(new Date('2024-06-15')),
      statusText: '2 out of 6 sections completed',
    },
  ];
  const primaryGridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 12;
  };

  const secondaryGridSize = () => {
    if (isMobile) {
      return 12;
    }
    if (isTablet) {
      return 6;
    }
    return 6;
  };

  return (
    <Box
      component='main'
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box paddingRight={'24px'} paddingLeft={isMobile ? '24px' : 0}>
        <PageHeader title={strings.YOUR_APPLICATIONS} />
        <Container maxWidth={false} sx={{ padding: 0 }}>
          <Grid container spacing={3} sx={{ padding: 0 }}>
            {applications.map((application) => (
              <Grid
                item
                xs={applications.length === 1 ? primaryGridSize() : secondaryGridSize()}
                key={application.applicationId}
              >
                <ApplicationCard {...application} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ApplicationListView;
