import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from '../common/EmptyMessage';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';
import { Facility } from 'src/api/types/facilities';
import EmptyStateContent from '../emptyStatePages/EmptyStateContent';
import { EMPTY_STATE_CONTENT_STYLES } from '../emptyStatePages/EmptyStatePage';
import SensorKitSetup from './SensorKitSetup';
import SeedBankDashboard from './dashboard/SeedBankDashboard';

declare global {
  interface Window {
    myChart: any;
    pvBatteryChart: any;
  }
}
const useStyles = makeStyles((theme) =>
  createStyles({
    placeholder: {
      display: 'flex',
      height: '100%',
    },
    text: {
      fontSize: '24px',
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    notSetUpContent: {
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      margin: 'auto',
      marginTop: `max(10vh, ${theme.spacing(8)}px)`,
      maxWidth: '800px',
    },
    graphContainer: {
      border: '1px solid #A9B7B8',
      padding: '24px',
    },
    graphTitle: {
      fontWeight: 600,
      fontSize: '20px',
      margin: '0 0 24px 0',
    },
    dropDownsContainer: {
      display: 'flex',
    },
    chartContainer: {
      marginTop: '40px',
    },
    chart: {
      width: '800px',
    },
    panelTitle: {
      display: 'flex',
      fontSize: '20px',
      fontWeight: 600,
      justifyContent: 'space-between',

      '& p': {
        margin: '0 0 32px 0',
      },
    },
    panelValue: {
      fontWeight: 600,
      fontSize: '48px',
      margin: 0,
    },
    mainGrid: {
      display: 'flex',
      width: '100%',
      margin: 0,
    },
  })
);

type SeedBankMonitoringProps = {
  seedBank: Facility;
  organization: ServerOrganization;
};

export default function Monitoring(props: SeedBankMonitoringProps): JSX.Element {
  const classes = useStyles();
  const { organization, seedBank } = props;
  const [onboarding, setOnboarding] = useState<boolean>(false);
  const isConfigured = seedBank.connectionState === 'Configured';

  useEffect(() => {
    const isConnected = seedBank.connectionState === 'Connected';
    setOnboarding(isConnected);
  }, [seedBank, setOnboarding]);

  const onFinishOnboarding = () => {
    setOnboarding(false);
  };

  return (
    <>
      {!isConfigured && !onboarding && (
        <>
          {isAdmin(organization) ? (
            <div className={classes.notSetUpContent}>
              <EmptyStateContent
                title={strings.SET_UP_YOUR_SENSOR_KIT}
                subtitle={strings.SET_UP_YOUR_SENSOR_KIT_MSG}
                listItems={[{ icon: 'monitoring', title: strings.SENSOR_KIT_SET_UP }]}
                buttonText={strings.START_SET_UP}
                onClickButton={() => setOnboarding(true)}
                styles={EMPTY_STATE_CONTENT_STYLES}
              />
            </div>
          ) : (
            <EmptyMessage
              className={classes.message}
              title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
              text={emptyMessageStrings.NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG}
            />
          )}
        </>
      )}
      {isConfigured && !onboarding && (
        <div className={classes.placeholder}>
          <span className={classes.text}>
            {seedBank?.connectionState === 'Configured' ? (
              <SeedBankDashboard seedBank={seedBank} />
            ) : (
              <>
                {isAdmin(organization) ? (
                  <div className={classes.notSetUpContent}>
                    <EmptyStateContent
                      title={strings.SET_UP_YOUR_SENSOR_KIT}
                      subtitle={strings.SET_UP_YOUR_SENSOR_KIT_MSG}
                      listItems={[{ icon: 'monitoring', title: strings.SENSOR_KIT_SET_UP }]}
                      buttonText={strings.START_SET_UP}
                      onClickButton={() => true}
                      styles={EMPTY_STATE_CONTENT_STYLES}
                    />
                  </div>
                ) : (
                  <EmptyMessage
                    className={classes.message}
                    title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
                    text={emptyMessageStrings.NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG}
                  />
                )}
              </>
            )}
          </span>
        </div>
      )}
      {onboarding && <SensorKitSetup organization={organization} seedBank={seedBank} onFinish={onFinishOnboarding} />}
    </>
  );
}
