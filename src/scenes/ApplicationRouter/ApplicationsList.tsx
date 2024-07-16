import React, { useState } from 'react';

import { Box, Container, Grid } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import ApplicationCard from 'src/components/Application/ApplicationCard';
import PageHeader from 'src/components/PageHeader';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import NewApplicationModal from './NewApplicationModal';
import { useApplicationData } from './provider/Context';

const ApplicationListView = () => {
  const { isTablet, isMobile } = useDeviceInfo();
  const { toastInfo } = useSnackbar();
  const { allApplications } = useApplicationData();
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState<boolean>(false);

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
        <PageHeader
          title={strings.YOUR_APPLICATIONS}
          rightComponent={
            <Button onClick={() => setIsNewApplicationModalOpen(true)} label={strings.START_NEW_APPLICATION} />
          }
        />
        <Container maxWidth={false} sx={{ padding: 0 }}>
          <NewApplicationModal
            open={isNewApplicationModalOpen}
            onClose={() => setIsNewApplicationModalOpen(false)}
            onSave={() => toastInfo('Create new application clicked')}
          />
          <Grid container spacing={3} sx={{ padding: 0 }}>
            {allApplications.map((application) => (
              <Grid
                item
                xs={allApplications.length === 1 ? primaryGridSize() : secondaryGridSize()}
                key={application.id}
              >
                <ApplicationCard
                  applicationId={application.id}
                  applicationName={`Applicatoin ${application.id}`}
                  completed={false}
                  dateStarted={DateTime.fromISO(application.createdTime)}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ApplicationListView;
