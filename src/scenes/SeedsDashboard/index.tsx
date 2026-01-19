import React, { type JSX } from 'react';

import { Box, CircularProgress, Container, Grid, SxProps, Typography, useTheme } from '@mui/material';
import Cookies from 'cookies-js';

import MainPaper from 'src/components/MainPaper';
import PageHeader from 'src/components/PageHeader';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import { useSeedBankSummary } from 'src/hooks/useSeedBankSummary';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import AccessionByStatus from 'src/scenes/SeedsDashboard/AccessionByStatus';
import SummaryPaper from 'src/scenes/SeedsDashboard/SummaryPaper';
import strings from 'src/strings';
import { AccessionState, stateName } from 'src/types/Accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';

Cookies.defaults = {
  path: '/',
  secure: true,
};

export default function SeedSummary(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const seedBankSummary = useSeedBankSummary();
  const isEmptyState = seedBankSummary ? !seedBankSummary.value?.activeAccessions : false;
  const errorOccurred = seedBankSummary ? !seedBankSummary.requestSucceeded : false;

  const paperStyles: SxProps = {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    alignItems: 'start',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
  };

  const cardGridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const cardStates: AccessionState[] = [
    'Awaiting Check-In',
    'Awaiting Processing',
    'Processing',
    'Drying',
    'In Storage',
    'Used Up',
  ];

  return (
    <TfMain>
      <PageHeader page={strings.SEEDS_DASHBOARD} parentPage={strings.SEEDS} snackbarPageKey={'seeds'} />
      <Container maxWidth={false} sx={{ padding: 0 }}>
        {selectedOrganization && seedBankSummary ? (
          <Grid container spacing={3}>
            {isEmptyState === true && (
              <Grid item xs={12} paddingBottom={theme.spacing(1)}>
                <Box
                  sx={{
                    background: theme.palette.TwClrBgInfoTertiary,
                    border: `1px solid ${theme.palette.TwClrBrdrInfo}`,
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    padding: theme.spacing(2.25, 6, 2.25, 2.25),
                  }}
                >
                  <Box sx={{ flexGrow: 0, marginRight: '18px' }}>
                    <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='large' />
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                    <Typography
                      sx={{
                        color: theme.palette.TwClrTxt,
                        fontWeight: 600,
                        size: '16px',
                        marginBottom: theme.spacing(1),
                      }}
                    >
                      {strings.DASHBOARD_MESSAGE_TITLE}
                    </Typography>
                    <Typography
                      sx={{
                        color: theme.palette.TwClrTxt,
                        fontWeight: 400,
                        size: '16px',
                        marginBottom: theme.spacing(2),
                      }}
                    >
                      {strings.DASHBOARD_MESSAGE}
                    </Typography>
                    <Box sx={{ alignSelf: 'end' }}>
                      <Button label={strings.GET_STARTED} onClick={() => navigate(APP_PATHS.ACCESSIONS)} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={cardGridSize()}>
                  <MainPaper sx={paperStyles}>
                    <SummaryPaper
                      id='seedCount'
                      title={strings.TOTAL_SEED_COUNT}
                      icon='seedbankNav'
                      statistic={`${seedBankSummary?.value?.seedsRemaining.total}${
                        seedBankSummary?.value?.seedsRemaining &&
                        seedBankSummary?.value?.seedsRemaining.unknownQuantityAccessions > 0
                          ? '+'
                          : ''
                      }`}
                      loading={seedBankSummary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={cardGridSize()}>
                  <MainPaper sx={paperStyles}>
                    <SummaryPaper
                      id='sessions'
                      title={strings.TOTAL_ACTIVE_ACCESSIONS}
                      icon='seeds'
                      statistic={seedBankSummary?.value?.activeAccessions}
                      loading={seedBankSummary === undefined}
                      error={errorOccurred}
                      tooltipTitle={strings.TOOLTIP_DASHBOARD_TOTAL_ACTIVE_ACCESSIONS}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={cardGridSize()}>
                  <MainPaper sx={paperStyles}>
                    <SummaryPaper
                      id='species'
                      title={strings.NUMBER_OF_SPECIES}
                      icon='species'
                      statistic={seedBankSummary?.value?.species}
                      loading={seedBankSummary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.TwClrBg,
                      border: 'none',
                      borderRadius: '24px',
                      padding: theme.spacing(3),
                    }}
                  >
                    <Box display='flex' alignContent='center' alignItems='center'>
                      <Icon fillColor={theme.palette.TwClrIcnSecondary} name='futures' size='medium' />
                      <Typography
                        fontSize='20px'
                        fontWeight={600}
                        color={theme.palette.TwClrTxt}
                        paddingLeft={theme.spacing(1)}
                      >
                        {strings.ACCESSION_BY_STATUS}
                      </Typography>
                    </Box>
                    <Grid container spacing={3} marginBottom={theme.spacing(3.5)}>
                      {cardStates.map((state) => (
                        <Grid item xs={cardGridSize()} key={state}>
                          <AccessionByStatus
                            label={stateName(state)}
                            status={stateName(state)}
                            quantity={seedBankSummary.value?.accessionsByState[state]}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Link to={`${APP_PATHS.ACCESSIONS}?stage=}`} fontSize='16px' style={{ marginRight: '12px' }}>
                      {strings.SEE_ALL_ACCESSIONS}
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: 'calc(50% + 100px)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Container>
    </TfMain>
  );
}
