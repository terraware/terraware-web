import { Container, Grid, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Cookies from 'cookies-js';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { SeedSearchCriteria } from 'src/api/seeds/search';
import { getSummary, GetSummaryResponse } from 'src/api/seeds/summary';
import TfMain from 'src/components/common/TfMain';
import MainPaper from 'src/components/MainPaper';
import { API_PULL_INTERVAL } from 'src/constants';
import { seedsSummarySelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageHeader from '../PageHeader';
import SummaryPaper from './SummaryPaper';
import Updates from './Updates';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: '32px 0',
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: '100%',
  },
  message: {
    margin: '0 auto',
    width: '50%',
    marginTop: '10%',
  },
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: 'calc(50% + 100px)',
  },
}));

Cookies.defaults = {
  path: '/',
  secure: true,
};

type SeedSummaryProps = {
  organization?: ServerOrganization;
  setSeedSearchCriteria: (criteria: SeedSearchCriteria) => void;
};

export default function SeedSummary(props: SeedSummaryProps): JSX.Element {
  const classes = useStyles();
  const { setSeedSearchCriteria, organization } = props;
  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [summary, setSummary] = useState<GetSummaryResponse>();
  const errorOccurred = summary ? summary.errorOccurred : false;
  const [, setSelectedOrgInfo] = useRecoilState(seedsSummarySelectedOrgInfo);

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

  return (
    <TfMain>
      <PageHeader subtitle={strings.WELCOME_MSG} page={strings.DASHBOARD} />
      <Container maxWidth={false} className={classes.mainContainer}>
        {organization && summary ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='sessions'
                      title={strings.ACTIVE_ACCESSIONS}
                      statistics={summary?.value?.activeAccessions}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={4}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='species'
                      title={strings.SPECIES}
                      statistics={summary?.value?.species}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={4}>
                  <MainPaper className={classes.paper}>
                    <SummaryPaper
                      id='families'
                      title={strings.FAMILY}
                      statistics={summary?.value?.families}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
                </Grid>
                <Grid item xs={12}>
                  <MainPaper className={`${classes.paper} ${classes.fixedHeight}`}>
                    <Updates
                      setSeedSearchCriteria={setSeedSearchCriteria}
                      summaryResponse={summary?.value}
                      loading={summary === undefined}
                      error={errorOccurred}
                    />
                  </MainPaper>
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
