import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Cookies from 'cookies-js';
import React from 'react';
import { useRecoilValueLoadable } from 'recoil';
import summarySelector from '../../../state/selectors/summary';
import strings from '../../../strings';
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

export default function Summary(): JSX.Element {
  const classes = useStyles();

  const summaryResponse = useRecoilValueLoadable(summarySelector);
  const contents =
    summaryResponse.state === 'hasValue' ? summaryResponse.contents : undefined;
  const isLoading = summaryResponse.state === 'loading';
  const hasError = summaryResponse.state === 'hasError';

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
                    statistics={contents?.activeAccessions}
                    loading={isLoading}
                    error={hasError}
                  />
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <SummaryPaper
                    id='species'
                    title={strings.SPECIES}
                    statistics={contents?.species}
                    loading={isLoading}
                    error={hasError}
                  />
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <SummaryPaper
                    id='families'
                    title={strings.FAMILY}
                    statistics={contents?.families}
                    loading={isLoading}
                    error={hasError}
                  />
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={`${classes.paper} ${classes.fixedHeight}`}>
                  <Alerts />
                </Paper>
              </Grid>
              <Grid item xs={8}>
                <Paper className={`${classes.paper} ${classes.fixedHeight}`}>
                  <Updates
                    summaryResponse={contents}
                    loading={isLoading}
                    error={hasError}
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
