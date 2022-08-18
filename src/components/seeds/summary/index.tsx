import { Container, Grid, CircularProgress, Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Cookies from 'cookies-js';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { getSummary, GetSummaryResponse } from 'src/api/seeds/summary';
import TfMain from 'src/components/common/TfMain';
import MainPaper from 'src/components/MainPaper';
import { API_PULL_INTERVAL, APP_PATHS } from 'src/constants';
import { seedsSummarySelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageHeader from '../PageHeader';
import SummaryPaper from './SummaryPaper';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import AccessionByStatus from './AccessionByStatus';
import { Link } from 'react-router-dom';
import useEnvironment from 'src/utils/useEnvironment';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: '32px 0',
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: 'calc(50% + 100px)',
  },
  accessionsLink: {
    textDecoration: 'none',
    fontWeight: 500,
    color: '#0067C8',
    marginRight: '12px',
  },
}));

Cookies.defaults = {
  path: '/',
  secure: true,
};

type SeedSummaryProps = {
  organization?: ServerOrganization;
};

export default function SeedSummary(props: SeedSummaryProps): JSX.Element {
  const classes = useStyles();
  const { organization } = props;
  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [summary, setSummary] = useState<GetSummaryResponse>();
  const errorOccurred = summary ? summary.errorOccurred : false;
  const [, setSelectedOrgInfo] = useRecoilState(seedsSummarySelectedOrgInfo);
  const { isMobile } = useDeviceInfo();
  const { isProduction } = useEnvironment();

  useEffect(() => {
    if (organization) {
      const seedbankFacility =
        organization && organization.facilities?.find((facility) => facility.name === 'Seed Bank');

      const populateSummary = async () => {
        setSummary(await getSummary(organization.id));
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
          return seedbankFacility?.id ? setInterval(populateSummary, API_PULL_INTERVAL) : undefined;
        });
      }

      setSelectedOrgInfo({
        selectedFacility: seedbankFacility,
      });
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
  }, [organization, setSelectedOrgInfo]);

  const cardGridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  return (
    <TfMain>
      <PageHeader subtitle={strings.WELCOME_MSG} page={strings.DASHBOARD} parentPage={strings.SEEDS} />
      <Container maxWidth={false} className={classes.mainContainer}>
        {organization && summary ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={cardGridSize()}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='sessions'
                      title={strings.ACTIVE_ACCESSIONS}
                      statistic={summary?.value?.activeAccessions}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={cardGridSize()}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='species'
                      title={strings.SPECIES}
                      statistic={summary?.value?.species}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={12}>
                  <Box display='flex' alignContent='center' justifyContent='space-between' alignItems='center'>
                    <Typography fontSize='20px' color='#000000' paddingBottom='8px' paddingLeft='28px'>
                      {strings.ACCESSION_BY_STATUS}
                    </Typography>
                    <Link className={classes.accessionsLink} to={APP_PATHS.ACCESSIONS}>
                      {strings.SEE_ALL_ACCESSIONS}
                    </Link>
                  </Box>
                  <Box display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                    <AccessionByStatus
                      label='Awaiting Check-in'
                      status='Awaiting Check-In'
                      quantity={summary.value?.accessionsByState['Awaiting Check-In']}
                    />
                    {!isProduction ? (
                      <AccessionByStatus
                        label='Awaiting Processing'
                        status='Awaiting Processing'
                        quantity={summary.value?.accessionsByState['Awaiting Processing']}
                      />
                    ) : null}
                    {!isProduction ? (
                      <AccessionByStatus
                        label='Cleaning'
                        status='Cleaning'
                        quantity={summary.value?.accessionsByState.Cleaning}
                      />
                    ) : null}
                    <AccessionByStatus
                      label='Drying'
                      status='Drying'
                      quantity={summary.value?.accessionsByState.Drying}
                    />
                    <AccessionByStatus
                      label='In Storage'
                      status='In Storage'
                      quantity={summary.value?.accessionsByState['In Storage']}
                    />
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
