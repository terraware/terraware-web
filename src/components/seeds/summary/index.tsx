import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Cookies from 'cookies-js';
import React, { useEffect, useState } from 'react';
import { SeedSearchCriteria } from 'src/api/seeds/search';
import { getSummary, GetSummaryResponse } from 'src/api/seeds/summary';
import { API_PULL_INTERVAL } from 'src/constants';
import strings from 'src/strings';
import { Notifications } from 'src/types/Notifications';
import PageHeader from '../PageHeader';
import Alerts from './Alerts';
import SummaryPaper from './SummaryPaper';
import Updates from './Updates';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: '100%',
    },
  })
);

Cookies.defaults = {
  path: '/',
  secure: true,
};

type SeedSummaryProps = {
  facilityId: number;
  setSeedSearchCriteria: (criteria: SeedSearchCriteria) => void;
  notifications?: Notifications;
};

export default function SeedSummary(props: SeedSummaryProps): JSX.Element {
  const classes = useStyles();
  const { facilityId, setSeedSearchCriteria, notifications } = props;
  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [summary, setSummary] = useState<GetSummaryResponse>();
  const errorOccurred = summary ? summary.errorOccurred : false;

  useEffect(() => {
    const populateSummary = async () => {
      setSummary(await getSummary(facilityId));
    };

    // Update summary information
    if (facilityId) {
      populateSummary();
    } else {
      setSummary(undefined);
    }

    // Update interval that keeps summary up to date
    if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
      setPopulateSummaryInterval((currInterval) => {
        if (currInterval) {
          // Clear an existing interval when the facilityId changes
          clearInterval(currInterval);
        }
        return facilityId ? setInterval(populateSummary, API_PULL_INTERVAL) : undefined;
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
  }, [facilityId]);

  return (
    <main>
      <PageHeader
        title={strings.SUMMARY}
        subtitle={strings.WELCOME_MSG}
        page={strings.DASHBOARD}
        parentPage={strings.SEEDS}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <SummaryPaper
                    id='sessions'
                    title={strings.ACTIVE_ACCESSIONS}
                    statistics={summary?.value?.activeAccessions}
                    loading={summary === undefined}
                    error={errorOccurred}
                  />
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <SummaryPaper
                    id='species'
                    title={strings.SPECIES}
                    statistics={summary?.value?.species}
                    loading={summary === undefined}
                    error={errorOccurred}
                  />
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <SummaryPaper
                    id='families'
                    title={strings.FAMILY}
                    statistics={summary?.value?.families}
                    loading={summary === undefined}
                    error={errorOccurred}
                  />
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={`${classes.paper} ${classes.fixedHeight}`}>
                  <Alerts notifications={notifications} />
                </Paper>
              </Grid>
              <Grid item xs={8}>
                <Paper className={`${classes.paper} ${classes.fixedHeight}`}>
                  <Updates
                    setSeedSearchCriteria={setSeedSearchCriteria}
                    summaryResponse={summary?.value}
                    loading={summary === undefined}
                    error={errorOccurred}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}
