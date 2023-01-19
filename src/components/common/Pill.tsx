import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import Icon from 'src/components/common/icon/Icon';

const useStyles = makeStyles((theme: Theme) => ({
  pill: {
    background: theme.palette.TwClrBgTertiary,
    padding: theme.spacing(0.5, 0.5, 0.5, 1.5),
    display: 'flex',
    borderRadius: '13px',
    alignItems: 'center',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  filter: {
    fontSize: '12px',
    color: theme.palette.TwClrTxt,
    fontWeight: 400,
    margin: 0,
  },
  value: {
    paddingLeft: theme.spacing(0.5),
    fontSize: '12px',
    color: theme.palette.TwClrTxt,
    fontWeight: 600,
    margin: 0,
  },
  icon: {
    fill: theme.palette.TwClrIcn,
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    margin: theme.spacing(0, 0.5),
  },
  iconContainer: {
    padding: 0,
  },
  spacer: {
    width: theme.spacing(1),
    height: theme.spacing(1.5),
  },
}));

type PillProps<IdType> = {
  id: IdType;
  label: string;
  value: string;
  onRemovePill?: (pillId: IdType) => void;
};

export default function Pill<IdType>({ id, label, value, onRemovePill }: PillProps<IdType>): JSX.Element {
  const classes = useStyles();
  return (
    <div className={classes.pill}>
      <p className={classes.filter}>{label}:</p>
      <p className={classes.value}>{value}</p>
      {onRemovePill ? (
        <IconButton onClick={() => onRemovePill(id)} className={classes.iconContainer}>
          <Icon name='close' className={classes.icon} />
        </IconButton>
      ) : (
        <div className={classes.spacer} />
      )}
    </div>
  );
}
