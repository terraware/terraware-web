import React from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import TfMain from 'src/components/common/TfMain';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import PageHeader from 'src/components/PageHeader';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    marginBottom: theme.spacing(8),
    padding: '0',
  },
  content: {
    background: theme.palette.TwClrBg,
    borderRadius: '24px',
    margin: 'auto',
    marginTop: (props: { isMobile: boolean }) =>
      props.isMobile ? `max(10vh, ${theme.spacing(8)}px)` : theme.spacing(8),
    maxWidth: '800px',
    padding: '24px',
  },
}));

const PreSetupView = () => {
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  const goToSettings = () => {
    history.push({
      pathname: APP_PATHS.REPORTS_SETTINGS_EDIT,
    });
  };

  return (
    <TfMain backgroundImageVisible={true}>
      <PageHeader title={strings.REPORTS} />
      <Container className={classes.mainContainer}>
        <div className={classes.content}>
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
        </div>
      </Container>
    </TfMain>
  );
};

export default PreSetupView;
