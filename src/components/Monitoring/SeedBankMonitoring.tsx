import React, { useEffect, useState } from 'react';

import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { isAdmin } from 'src/utils/organization';

import EmptyMessage from '../common/EmptyMessage';
import EmptyStateContent from '../emptyStatePages/EmptyStateContent';
import SensorKitSetup from './SensorKitSetup';
import SeedBankDashboard from './dashboard/SeedBankDashboard';

const useStyles = makeStyles((theme: Theme) => ({
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
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
    background: theme.palette.TwClrBg,
    border: `1px solid transparent`,
    borderRadius: '24px',
    margin: 'auto',
    marginTop: `max(10vh, ${theme.spacing(8)}px)`,
    maxWidth: '800px',
    padding: '24px',
  },
}));

type SeedBankMonitoringProps = {
  seedBank: Facility;
  reloadData: () => void;
  monitoringPreferences: { [key: string]: unknown };
  updatePreferences: (data: { [key: string]: unknown }) => void;
};

export default function Monitoring(props: SeedBankMonitoringProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const { seedBank, reloadData, monitoringPreferences, updatePreferences } = props;
  const [onboarding, setOnboarding] = useState<boolean>(false);
  const isConfigured = seedBank.connectionState === 'Configured';

  useEffect(() => {
    const isConnected = seedBank.connectionState === 'Connected';
    setOnboarding(isConnected);
  }, [seedBank, setOnboarding]);

  const onFinishOnboarding = () => {
    reloadData();
  };

  return (
    <>
      {!isConfigured && !onboarding && (
        <>
          {isAdmin(selectedOrganization) ? (
            <Grid item xs={12} marginTop='10%'>
              <div className={classes.notSetUpContent}>
                <EmptyStateContent
                  title={strings.SET_UP_YOUR_SENSOR_KIT}
                  subtitle={strings.SET_UP_YOUR_SENSOR_KIT_MSG}
                  listItems={[{ icon: 'monitoring' }]}
                  buttonText={strings.SET_UP}
                  onClickButton={() => setOnboarding(true)}
                />
              </div>
            </Grid>
          ) : (
            <EmptyMessage
              className={classes.message}
              title={strings.REACH_OUT_TO_ADMIN_TITLE}
              text={strings.NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG}
            />
          )}
        </>
      )}
      {isConfigured && !onboarding && (
        <div className={classes.placeholder}>
          <span className={classes.text}>
            <SeedBankDashboard
              seedBank={seedBank}
              monitoringPreferences={monitoringPreferences}
              updatePreferences={updatePreferences}
            />
          </span>
        </div>
      )}
      {onboarding && <SensorKitSetup seedBank={seedBank} onFinish={onFinishOnboarding} reloadData={reloadData} />}
    </>
  );
}
