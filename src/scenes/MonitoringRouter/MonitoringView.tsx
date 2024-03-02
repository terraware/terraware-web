import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import SeedBankMonitoring from 'src/components/Monitoring/SeedBankMonitoring';
import PageSnackbar from 'src/components/PageSnackbar';
import EmptyMessage from 'src/components/common/EmptyMessage';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import Select from 'src/components/common/Select/Select';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { PreferencesService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { getAllSeedBanks, isAdmin } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
  isDesktop: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  message: {
    margin: '0 auto',
    marginTop: (props: StyleProps) => (props.isMobile ? '32px' : '80px'),
    maxWidth: '800px',
    padding: '24px 48px 48px',
  },
  titleRootContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: (props: StyleProps) => theme.spacing(props.isDesktop ? 3 : 0),
    paddingTop: (props: StyleProps) => theme.spacing(props.isMobile ? 2 : 0),
  },
  contentContainer: {
    width: '100%',
  },
  divider: {
    margin: theme.spacing(0, 2),
    width: '1px',
    height: '32px',
    backgroundColor: theme.palette.TwClrBgTertiary,
  },
  seedBankLabel: {
    margin: '0 8px 0 0',
    fontWeight: 500,
    fontSize: '16px',
  },
}));

type MonitoringProps = {
  hasSeedBanks: boolean;
  reloadData: () => void;
};

export default function MonitoringView(props: MonitoringProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization.id;
  const { isDesktop, isMobile } = useDeviceInfo();
  const classes = useStyles({ isDesktop, isMobile });
  const theme = useTheme();
  const history = useHistory();
  const { hasSeedBanks, reloadData } = props;
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const [seedBanks, setSeedBanks] = useState<Facility[]>([]);
  const [monitoringPreferences, setMonitoringPreferences] = useState<{ [key: string]: unknown }>();
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const contentRef = useRef(null);

  const goToSeedBanks = () => {
    const seedBanksLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(seedBanksLocation);
  };

  const setActiveSeedBank = useCallback(
    (seedBank: Facility | undefined) => {
      if (seedBank) {
        history.push(APP_PATHS.MONITORING_SEED_BANK.replace(':seedBankId', seedBank.id.toString()));
      }
    },
    [history]
  );

  const onChangeSeedBank = (newValue: string) => {
    setActiveSeedBank(seedBanks.find((sb) => sb?.name === newValue));
  };

  useEffect(() => {
    const facilities: Facility[] = [];
    getAllSeedBanks(selectedOrganization).forEach((facility) => {
      if (facility !== undefined) {
        facilities.push(facility);
      }
    });
    setSeedBanks(facilities);
  }, [selectedOrganization]);

  useEffect(() => {
    const initializeSeedBank = async () => {
      if (seedBanks.length) {
        let lastMonitoringSeedBank: any = {};
        const response = await PreferencesService.getUserOrgPreferences(organizationId);
        if (response.requestSucceeded && response.preferences?.lastMonitoringSeedBank) {
          lastMonitoringSeedBank = response.preferences.lastMonitoringSeedBank;
        }
        const seedBankIdToUse = seedBankId || lastMonitoringSeedBank.facilityId;
        const requestedSeedBank = seedBanks.find((sb) => sb?.id === parseInt(seedBankIdToUse, 10));
        const seedBankToUse = requestedSeedBank || seedBanks[0];
        if (seedBankToUse.id !== lastMonitoringSeedBank.facilityId) {
          lastMonitoringSeedBank = { facilityId: seedBankToUse.id };
          if (seedBankToUse.connectionState !== 'Configured') {
            PreferencesService.updateUserOrgPreferences(organizationId, { lastMonitoringSeedBank });
          }
        }
        setMonitoringPreferences(lastMonitoringSeedBank);
        if (seedBankToUse.id.toString() === seedBankId) {
          setSelectedSeedBank(seedBankToUse);
        } else {
          setActiveSeedBank(seedBankToUse);
        }
      }
    };
    initializeSeedBank();
  }, [seedBankId, seedBanks, setActiveSeedBank, organizationId]);

  const updateMonitoringPreferences = (data: { [key: string]: unknown }) => {
    setMonitoringPreferences(data);
    PreferencesService.updateUserOrgPreferences(organizationId, { lastMonitoringSeedBank: data }); // no need to wait for response
  };

  const getPageHeading = () => (
    <Typography fontSize='24px' fontWeight={600}>
      {strings.MONITORING}
    </Typography>
  );

  return (
    <TfMain backgroundImageVisible={!hasSeedBanks}>
      <Grid container>
        {hasSeedBanks ? (
          <>
            <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
              <Grid item xs={12} marginBottom={theme.spacing(4)} className={isMobile ? '' : classes.titleRootContainer}>
                {isMobile ? (
                  <>
                    <Box display='flex'>
                      <Grid item xs={10}>
                        {getPageHeading()}
                      </Grid>
                      {selectedSeedBank?.connectionState === 'Configured' ? (
                        <Grid item xs={2} display='flex' justifyContent='end'>
                          <Button label={strings.REFRESH} onClick={reloadData} />
                        </Grid>
                      ) : null}
                    </Box>
                    <Grid item xs={12} className={classes.titleContainer} paddingTop='12px'>
                      <p className={classes.seedBankLabel}>{strings.SEED_BANK}</p>
                      <Select
                        options={seedBanks.map((sb) => sb?.name || '')}
                        onChange={onChangeSeedBank}
                        selectedValue={selectedSeedBank?.name}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={10} alignItems='center' className={classes.titleContainer}>
                      {getPageHeading()}
                      <div className={classes.divider} />
                      <p className={classes.seedBankLabel}>{strings.SEED_BANK}</p>
                      <Select
                        options={seedBanks.map((sb) => sb?.name || '')}
                        onChange={onChangeSeedBank}
                        selectedValue={selectedSeedBank?.name}
                      />
                    </Grid>
                    {selectedSeedBank?.connectionState === 'Configured' ? (
                      <Grid item xs={2} display='flex' justifyContent='end'>
                        <Button label={strings.REFRESH_DATA} size='medium' onClick={reloadData} />
                      </Grid>
                    ) : null}
                  </>
                )}
              </Grid>
              <PageSnackbar />
            </PageHeaderWrapper>

            {selectedSeedBank && monitoringPreferences && (
              <div ref={contentRef} className={classes.contentContainer}>
                <SeedBankMonitoring
                  monitoringPreferences={monitoringPreferences}
                  updatePreferences={(data) => updateMonitoringPreferences(data)}
                  seedBank={selectedSeedBank}
                  reloadData={reloadData}
                />
              </div>
            )}
          </>
        ) : isAdmin(selectedOrganization) ? (
          <Grid item xs={12} className={isMobile ? '' : classes.titleContainer} flexDirection='column'>
            {getPageHeading()}
            <PageSnackbar />
            <EmptyMessage
              className={classes.message}
              title={strings.NO_SEEDBANKS_ADMIN_TITLE}
              text={strings.NO_SEEDBANKS_MONITORING_ADMIN_MSG}
              buttonText={strings.GO_TO_SEED_BANKS}
              onClick={goToSeedBanks}
            />
          </Grid>
        ) : (
          <Grid item xs={12} className={isMobile ? '' : classes.titleContainer} flexDirection='column'>
            {getPageHeading()}
            <PageSnackbar />
            <EmptyMessage
              className={classes.message}
              title={strings.REACH_OUT_TO_ADMIN_TITLE}
              text={strings.NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG}
            />
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
