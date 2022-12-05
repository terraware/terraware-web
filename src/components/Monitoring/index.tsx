import { makeStyles } from '@mui/styles';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from '../common/EmptyMessage';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import { getAllSeedBanks, isAdmin } from 'src/utils/organization';
import TfMain from '../common/TfMain';
import Select from '../common/Select/Select';
import { Facility } from 'src/api/types/facilities';
import { getPreferences, updatePreferences } from 'src/api/preferences/preferences';
import SeedBankMonitoring from './SeedBankMonitoring';
import Button from '../common/button/Button';
import { Box, Grid, Theme, Typography } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';

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
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
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
  organization: ServerOrganization;
  hasSeedBanks: boolean;
  reloadData: () => void;
};

export default function Monitoring(props: MonitoringProps): JSX.Element {
  const { isDesktop, isMobile } = useDeviceInfo();
  const classes = useStyles({ isDesktop, isMobile });
  const history = useHistory();
  const { organization, hasSeedBanks, reloadData } = props;
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
        history.push(APP_PATHS.SEED_BANK_MONITORING.replace(':seedBankId', seedBank.id.toString()));
      }
    },
    [history]
  );

  const onChangeSeedBank = (newValue: string) => {
    setActiveSeedBank(seedBanks.find((sb) => sb?.name === newValue));
  };

  useEffect(() => {
    const facilities: Facility[] = [];
    getAllSeedBanks(organization).forEach((facility) => {
      if (facility !== undefined) {
        facilities.push(facility);
      }
    });
    setSeedBanks(facilities);
  }, [organization]);

  useEffect(() => {
    const initializeSeedBank = async () => {
      if (seedBanks.length) {
        let lastMonitoringSeedBank: any = {};
        const response = await getPreferences(organization.id);
        if (response.requestSucceeded && response.preferences?.lastMonitoringSeedBank) {
          lastMonitoringSeedBank = response.preferences.lastMonitoringSeedBank;
        }
        const seedBankIdToUse = seedBankId || lastMonitoringSeedBank.facilityId;
        const requestedSeedBank = seedBanks.find((sb) => sb?.id === parseInt(seedBankIdToUse, 10));
        const seedBankToUse = requestedSeedBank || seedBanks[0];
        if (seedBankToUse.id !== lastMonitoringSeedBank.facilityId) {
          lastMonitoringSeedBank = { facilityId: seedBankToUse.id };
          if (seedBankToUse.connectionState !== 'Configured') {
            updatePreferences('lastMonitoringSeedBank', lastMonitoringSeedBank, organization.id); // no need to wait for response
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
  }, [seedBankId, seedBanks, setActiveSeedBank, organization.id]);

  const updateMonitoringPreferences = (data: { [key: string]: unknown }) => {
    setMonitoringPreferences(data);
    updatePreferences('lastMonitoringSeedBank', data, organization.id); // no need to wait for response
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
            <PageHeaderWrapper nextElement={contentRef.current}>
              <Grid item xs={12} className={isMobile ? '' : classes.titleContainer}>
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
                  organization={organization}
                  reloadData={reloadData}
                />
              </div>
            )}
          </>
        ) : isAdmin(organization) ? (
          <Grid item xs={12} className={isMobile ? '' : classes.titleContainer} flexDirection='column'>
            {getPageHeading()}
            <PageSnackbar />
            <EmptyMessage
              className={classes.message}
              title={emptyMessageStrings.NO_SEEDBANKS_ADMIN_TITLE}
              text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_ADMIN_MSG}
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
              title={emptyMessageStrings.REACH_OUT_TO_ADMIN_TITLE}
              text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG}
            />
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
