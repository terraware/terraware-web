import { Box, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    bold: {
      fontWeight: theme.typography.fontWeightBold,
      whiteSpace: 'pre-line',
    },
    summaryDefault: {
      position: 'relative',
      borderRadius: 8,
      backgroundColor: theme.palette.neutral[200],
      padding: theme.spacing(2),
    },
    summaryAvailable: {
      borderRadius: 8,
      backgroundColor: theme.palette.neutral[700],
      padding: theme.spacing(2),
      color: theme.palette.common.white,
    },
    summaryZero: {
      borderRadius: 8,
      backgroundColor: theme.palette.state[5],
      padding: theme.spacing(2),
      color: theme.palette.common.white,
    },
    full: {
      borderRadius: 8,
      backgroundColor: theme.palette.neutral[200],
      padding: theme.spacing(2),
      height: '100%',
      boxSizing: 'border-box',
    },
    infoIcon: {
      position: 'absolute',
      right: theme.spacing(2),
    },
  })
);

export interface Props {
  id?: string;
  title: string;
  value: number | string;
  variant?: 'default' | 'available' | 'zero' | 'full';
  icon?: boolean;
  onIconClick?: () => void;
}

export default function SummaryBox({
  title,
  value,
  variant = 'default',
  id,
  icon,
  onIconClick,
}: Props): JSX.Element {
  const classes = useStyles();

  const style =
    variant === 'default'
      ? classes.summaryDefault
      : variant === 'available'
      ? classes.summaryAvailable
      : variant === 'full'
      ? classes.full
      : classes.summaryZero;

  return (
    <Box className={style} id={id}>
      {icon && (
        <IconButton className={classes.infoIcon} onClick={onIconClick}>
          <InfoIcon />
        </IconButton>
      )}
      <Typography component='p'>{title}</Typography>
      <Typography component='p' variant='h6' className={classes.bold}>
        {value}
      </Typography>
    </Box>
  );
}
