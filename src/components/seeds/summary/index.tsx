import { Container, Grid, CircularProgress, Box, Typography, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Cookies from 'cookies-js';
import React, { useEffect, useState } from 'react';
import { getSummary, GetSummaryResponse } from 'src/api/seeds/summary';
import TfMain from 'src/components/common/TfMain';
import MainPaper from 'src/components/MainPaper';
import { API_PULL_INTERVAL, APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import PageHeader from '../PageHeader';
import SummaryPaper from './SummaryPaper';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import AccessionByStatus from './AccessionByStatus';
import { useHistory } from 'react-router-dom';
import Link from 'src/components/common/Link';
import { useOrganization } from 'src/providers/hooks';
import { AccessionState, stateName } from '../../../types/Accession';

const useStyles = makeStyles((theme: Theme) => ({
  accessionsLink: {
    marginRight: '12px',
  },
  mainContainer: {
    padding: 0,
  },
  messageIcon: {
    fill: theme.palette.TwClrIcnInfo,
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    alignItems: 'start',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
  },
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: 'calc(50% + 100px)',
  },
  accessionsByStatusIcon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
}));

Cookies.defaults = {
  path: '/',
  secure: true,
};

export default function SeedSummary(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const history = useHistory();
  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [summary, setSummary] = useState<GetSummaryResponse>();
  const [isEmptyState, setIsEmptyState] = useState<boolean>(false);
  const errorOccurred = summary ? summary.errorOccurred : false;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  useEffect(() => {
    if (selectedOrganization) {
      const populateSummary = async () => {
        const response = await getSummary(selectedOrganization.id);
        if (!response.value?.activeAccessions) {
          setIsEmptyState(true);
        }
        setSummary(response);
      };

      // Update summary information
      populateSummary();

      // Update interval that keeps summary up to date
      if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
        setPopulateSummaryInterval((currInterval) => {
          if (currInterval) {
            // Clear an existing interval when the facilityId changes
            clearInterval(currInterval);
          }
          return setInterval(populateSummary, API_PULL_INTERVAL);
        });
      }
    }

    // Clear interval on exit
    return () => {
      setPopulateSummaryInterval((currInterval) => {
        if (currInterval) {
          clearInterval(currInterval);
        }
        return undefined;
      });
    };
  }, [selectedOrganization]);

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
  ];

  return (
    <TfMain>
      <PageHeader subtitle={strings.WELCOME_MSG} page={strings.SEED_DASHBOARD} parentPage={strings.SEEDS} />
      <Container maxWidth={false} className={classes.mainContainer}>
        {selectedOrganization && summary ? (
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
                    <Icon name='info' className={classes.messageIcon} size='large' />
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
                      <Button label={strings.GET_STARTED} onClick={() => history.push(APP_PATHS.ACCESSIONS)} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={cardGridSize()}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='seedCount'
                      title={strings.TOTAL_SEED_COUNT}
                      icon='seedbankNav'
                      statistic={`${summary?.value?.seedsRemaining.total}${
                        summary?.value?.seedsRemaining && summary?.value?.seedsRemaining.unknownQuantityAccessions > 0
                          ? '+'
                          : ''
                      }`}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={cardGridSize()}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='sessions'
                      title={strings.TOTAL_ACTIVE_ACCESSIONS}
                      icon='seeds'
                      statistic={summary?.value?.activeAccessions}
                      loading={summary === undefined}
                      error={errorOccurred}
                      tooltipTitle={strings.TOOLTIP_DASHBOARD_TOTAL_ACTIVE_ACCESSIONS}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={cardGridSize()}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='species'
                      title={strings.NUMBER_OF_SPECIES}
                      icon='species'
                      statistic={summary?.value?.species}
                      loading={summary === undefined}
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
                      <Icon name='futures' size='medium' className={classes.accessionsByStatusIcon} />
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
                            status={state}
                            quantity={summary.value?.accessionsByState[state]}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Link className={classes.accessionsLink} to={`${APP_PATHS.ACCESSIONS}?stage=}`} fontSize='16px'>
                      {strings.SEE_ALL_ACCESSIONS}
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <div className={classes.spinnerContainer}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </TfMain>
  );
}
