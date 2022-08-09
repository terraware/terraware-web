import { makeStyles } from '@mui/styles';
import React, { useEffect, useState, useCallback } from 'react';
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
import Title from '../common/Title';
import { Box, Grid } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles(() => ({
  mainTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  message: {
    margin: '0 auto',
    marginTop: '10%',
    maxWidth: '800px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    margin: '0 1%',
    width: '1px',
    height: '32px',
    backgroundColor: '#A9B7B8',
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
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const history = useHistory();
  const { organization, hasSeedBanks, reloadData } = props;
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const [seedBanks, setSeedBanks] = useState<Facility[]>([]);
  const [monitoringPreferences, setMonitoringPreferences] = useState<{ [key: string]: unknown }>();
  const { seedBankId } = useParams<{ seedBankId: string }>();

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
        try {
          const response = await getPreferences(organization.id);
          if (response.requestSucceeded && response.preferences?.lastMonitoringSeedBank) {
            lastMonitoringSeedBank = response.preferences.lastMonitoringSeedBank;
          }
        } catch (e) {
          // eslint-disable-next-line no-empty
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

  const getPageHeading = () => <Title page={strings.MONITORING} parentPage={strings.SEEDS} />;

  return (
    <TfMain>
      {hasSeedBanks ? (
        <>
          <Grid container>
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
                      <Button label={strings.REFRESH_DATA} onClick={reloadData} />
                    </Grid>
                  ) : null}
                </>
              )}
            </Grid>

            {selectedSeedBank && monitoringPreferences && (
              <SeedBankMonitoring
                monitoringPreferences={monitoringPreferences}
                updatePreferences={(data) => updateMonitoringPreferences(data)}
                seedBank={selectedSeedBank}
                organization={organization}
                reloadData={reloadData}
              />
            )}
          </Grid>
        </>
      ) : isAdmin(organization) ? (
        <>
          {getPageHeading()}
          <EmptyMessage
            className={classes.message}
            title={emptyMessageStrings.NO_SEEDBANKS_ADMIN_TITLE}
            text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_ADMIN_MSG}
            buttonText={strings.GO_TO_SEED_BANKS}
            onClick={goToSeedBanks}
          />
        </>
      ) : (
        <>
          {getPageHeading()}
          <EmptyMessage
            className={classes.message}
            title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
            text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG}
          />
        </>
      )}
    </TfMain>
  );
}
