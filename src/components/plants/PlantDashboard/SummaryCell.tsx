import { TableCell } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React from 'react';
import strings from 'src/strings';

const useStyles = makeStyles((theme) =>
  createStyles({
    panelTitle: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
      color: '#3A4445',
    },
    depositContext: {
      flex: 1,
      marginLeft: theme.spacing(1),
    },
    details: {
      display: 'flex',
      height: '24px',
    },
    cell: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    border: {
      borderRight: `1px solid ${theme.palette.grey[300]}`,
      padding: theme.spacing(5, 1),
    },
    iconDown: {
      fill: '#FE0003',
    },
    iconUp: {
      fill: '#308F5F',
    },
  })
);

interface SummaryProps {
  title: string;
  current: number;
  lastWeek: number;
  className?: string;
}

export default function SummaryCell({ title, current, lastWeek, className }: SummaryProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.cell}>
      <div>
        <Typography component='h2' variant='h6' gutterBottom id={`summary-${title}`} className={classes.panelTitle}>
          {current} {title}
        </Typography>
        <div className={classes.details}>
          {lastWeek !== 0 && (
            <>
              {current - lastWeek < 0 && (
                <ArrowDownwardIcon id={`${title}-arrow-decrease`} color='error' className={classes.iconDown} />
              )}
              {current - lastWeek > 0 && (
                <ArrowUpwardIcon id={`${title}-arrow-increase`} color='primary' className={classes.iconUp} />
              )}
              <Typography color='textSecondary' className={classes.depositContext} id={`summary-${title}-value`}>
                {strings.formatString(strings.GROWTH_SINCE_LAST_WEEK, calculateGrowth(current, lastWeek))}
              </Typography>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateGrowth(current: number, lastWeek: number): number {
  return Math.round(Math.abs(((current - lastWeek) * 100) / (lastWeek ?? 1)));
}
