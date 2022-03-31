import { CircularProgress } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React from 'react';
import { SummaryStatistic } from 'src/api/seeds/summary';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

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
                <ArrowDownwardIcon id={`${id}-arrow-decrease`} color='inherit' className={classes.iconDown} />
              ) : (
                <ArrowUpwardIcon id={`${id}-arrow-increase`} color='inherit' className={classes.iconUp} />
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
