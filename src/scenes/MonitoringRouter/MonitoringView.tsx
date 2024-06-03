import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';

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

type MonitoringProps = {
  hasSeedBanks: boolean;
  reloadData: () => void;
};

export default function MonitoringView(props: MonitoringProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization.id;
  const { isDesktop, isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasSeedBanks, reloadData } = props;
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const [seedBanks, setSeedBanks] = useState<Facility[]>([]);
  const [monitoringPreferences, setMonitoringPreferences] = useState<{ [key: string]: unknown }>();
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const contentRef = useRef(null);

  const messageStyles = {
    margin: '0 auto',
    marginTop: isMobile ? '32px' : '80px',
    maxWidth: '800px',
    padding: '24px 48px 48px',
  };

  const titleContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(isDesktop ? 3 : 0),
    paddingTop: theme.spacing(isMobile ? 2 : 0),
  };

  const seedBankLabelStyles = {
    margin: '0 8px 0 0',
    fontWeight: 500,
    fontSize: '16px',
  };

  const goToSeedBanks = () => {
    const seedBanksLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    navigate(seedBanksLocation);
  };

  const setActiveSeedBank = useCallback(
    (seedBank: Facility | undefined) => {
      if (seedBank) {
        navigate(APP_PATHS.MONITORING_SEED_BANK.replace(':seedBankId', seedBank.id.toString()));
      }
    },
    [navigate]
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
              <Grid
                item
                xs={12}
                marginBottom={theme.spacing(4)}
                sx={
                  isMobile
                    ? {}
                    : {
                        display: 'flex',
                        alignItems: 'center',
                      }
                }
              >
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
                    <Grid item xs={12} paddingTop='12px' sx={titleContainerStyles}>
                      <p style={seedBankLabelStyles}>{strings.SEED_BANK}</p>
                      <Select
                        options={seedBanks.map((sb) => sb?.name || '')}
                        onChange={onChangeSeedBank}
                        selectedValue={selectedSeedBank?.name}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={10} alignItems='center' sx={titleContainerStyles}>
                      {getPageHeading()}
                      <Box
                        sx={{
                          margin: theme.spacing(0, 2),
                          width: '1px',
                          height: '32px',
                          backgroundColor: theme.palette.TwClrBgTertiary,
                        }}
                      />
                      <p style={seedBankLabelStyles}>{strings.SEED_BANK}</p>
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
              <Box ref={contentRef} sx={{ width: '100%' }}>
                <SeedBankMonitoring
                  monitoringPreferences={monitoringPreferences}
                  updatePreferences={(data) => updateMonitoringPreferences(data)}
                  seedBank={selectedSeedBank}
                  reloadData={reloadData}
                />
              </Box>
            )}
          </>
        ) : isAdmin(selectedOrganization) ? (
          <Grid item xs={12} flexDirection='column' sx={isMobile ? {} : titleContainerStyles}>
            {getPageHeading()}
            <PageSnackbar />
            <EmptyMessage
              title={strings.NO_SEEDBANKS_ADMIN_TITLE}
              text={strings.NO_SEEDBANKS_MONITORING_ADMIN_MSG}
              buttonText={strings.GO_TO_SEED_BANKS}
              onClick={goToSeedBanks}
              sx={messageStyles}
            />
          </Grid>
        ) : (
          <Grid item xs={12} flexDirection='column' sx={isMobile ? {} : titleContainerStyles}>
            {getPageHeading()}
            <PageSnackbar />
            <EmptyMessage
              title={strings.REACH_OUT_TO_ADMIN_TITLE}
              text={strings.NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG}
              sx={messageStyles}
            />
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
