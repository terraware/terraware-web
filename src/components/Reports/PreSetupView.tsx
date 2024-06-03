import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Container, useTheme } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const PreSetupView = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const goToSettings = () => {
    navigate({
      pathname: APP_PATHS.REPORTS_SETTINGS_EDIT,
    });
  };

  return (
    <TfMain backgroundImageVisible={true}>
      <PageHeader title={strings.REPORTS} />
      <Container sx={{ marginBottom: theme.spacing(8), padding: '0' }}>
        <Box
          sx={{
            background: theme.palette.TwClrBg,
            borderRadius: '24px',
            margin: 'auto',
            marginTop: isMobile ? `max(10vh, ${theme.spacing(8)}px)` : theme.spacing(8),
            maxWidth: '800px',
            padding: '24px',
          }}
        >
          <EmptyStateContent
            title={strings.REPORTS_SETTINGS}
            subtitle={[strings.REPORTS_PRE_SETUP_SUBTITLE, strings.REPORTS_PRE_SETUP_SUBTITLE_2]}
            listItems={[
              {
                icon: 'blobbyIconGraphReport',
              },
            ]}
            buttonText={strings.REPORTS_SETUP_CTA}
            onClickButton={goToSettings}
          />
        </Box>
      </Container>
    </TfMain>
  );
};

export default PreSetupView;
