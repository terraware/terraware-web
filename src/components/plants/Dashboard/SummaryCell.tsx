import { TableCell } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import React from 'react';
import strings from '../../../strings';

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
    cell: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    border: {
      borderRight: `1px solid ${theme.palette.grey[300]}`,
      padding: theme.spacing(5, 1),
    },
  })
);

interface SummaryProps {
  title: string;
  current: number;
  lastWeek: number;
}

export default function SummaryCell({
  title,
  current,
  lastWeek,
}: SummaryProps): JSX.Element {
  const classes = useStyles();

  return (
    <TableCell className={classes.border}>
      <div className={classes.cell}>
        <div>
          <Typography
            component='h2'
            variant='h6'
            gutterBottom
            id={`summary-${title}`}
          >
            {current} {title}
          </Typography>
          <div className={classes.details}>
            {lastWeek !== 0 && (
              <>
                {current - lastWeek < 0 && (
                  <ArrowDownwardIcon
                    id={`${title}-arrow-decrease`}
                    color='error'
                  />
                )}
                {current - lastWeek > 0 && (
                  <ArrowUpwardIcon
                    id={`${title}-arrow-increase`}
                    color='primary'
                  />
                )}
                <Typography
                  color='textSecondary'
                  className={classes.depositContext}
                  id={`summary-${title}-value`}
                >
                  {strings.formatString(
                    strings.GROWTH_SINCE_LAST_WEEK,
                    calculateGrowth(current, lastWeek)
                  )}
                </Typography>
              </>
            )}
          </div>
        </div>
      </div>
    </TableCell>
  );
}

function calculateGrowth(current: number, lastWeek: number): number {
  return Math.round(Math.abs(((current - lastWeek) * 100) / (lastWeek ?? 1)));
}
