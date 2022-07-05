import { CircularProgress, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React from 'react';
import { SummaryStatistic } from 'src/api/seeds/summary';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  depositContext: {
    flex: 1,
    marginLeft: theme.spacing(1),
  },
  details: {
    display: 'flex',
    height: '24px',
  },
  iconDown: {
    fill: '#FE0003',
  },
  iconUp: {
    fill: '#308F5F',
  },
}));

interface Props {
  id: string;
  title: string;
  statistics?: SummaryStatistic;
  loading: boolean;
  error: boolean;
}

export default function SummaryPaper({ id, title, statistics, loading, error }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <>
      <PanelTitle title={title} gutterBottom={true} />
      {error && strings.GENERIC_ERROR}
      {loading && <CircularProgress id={`spinner-summary-${id}`} />}
      {statistics && (
        <>
          <Typography id={`${id}-current`} component='p' variant='h4'>
            {statistics.current}
          </Typography>
          <div id={`${id}-details`} className={classes.details}>
            {statistics.lastWeek !== 0 &&
              (statistics.current - statistics.lastWeek < 0 ? (
                <ArrowDownward id={`${id}-arrow-decrease`} color='inherit' className={classes.iconDown} />
              ) : (
                <ArrowUpward id={`${id}-arrow-increase`} color='inherit' className={classes.iconUp} />
              ))}
            {statistics.lastWeek !== 0 && (
              <Typography id={`${id}-change`} color='textSecondary' className={classes.depositContext}>
                {strings.formatString(strings.GROWTH_SINCE_LAST_WEEK, calculateGrowth(statistics))}
              </Typography>
            )}
          </div>
        </>
      )}
    </>
  );
}

function calculateGrowth(summaryStatistics: SummaryStatistic): number {
  return Math.round(
    Math.abs(((summaryStatistics.current - summaryStatistics.lastWeek) * 100) / summaryStatistics.lastWeek)
  );
}
