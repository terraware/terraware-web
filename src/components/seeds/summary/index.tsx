import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Cookies from 'cookies-js';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import PageHeader from '../PageHeader';
import Alerts from './Alerts';
import SummaryPaper from './SummaryPaper';
import Updates from './Updates';
import { Notifications } from '../../../types/Notifications';
import { getSummary, GetSummaryResponse } from 'src/api/seeds/summary';
import { API_PULL_INTERVAL } from '../../../constants';

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
  notifications?: Notifications;
};

export default function SeedSummary(props: SeedSummaryProps): JSX.Element {
  const classes = useStyles();
  const { facilityId, notifications } = props;
  const [summary, setSummary] = useState<GetSummaryResponse>();
  const errorOccurred = summary ? summary.errorOccurred : false;

  useEffect(() => {
    const populateSummary = async () => {
      setSummary(await getSummary(facilityId));
    };
    let interval: ReturnType<typeof setInterval>;
    if (facilityId) {
      populateSummary();
      if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
        interval = setInterval(() => {
          populateSummary();
        }, API_PULL_INTERVAL);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [facilityId]);

  return (
    <main>
      <PageHeader title={strings.SUMMARY} subtitle={strings.WELCOME_MSG} />
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
                  <Updates summaryResponse={summary?.value} loading={summary === undefined} error={errorOccurred} />
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
