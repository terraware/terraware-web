import { IconButton } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Icon from 'src/components/common/icon/Icon';

const useStyles = makeStyles((theme) =>
  createStyles({
    pill: {
      background: '#CAD2D3',
      padding: '4px 4px 4px 12px',
      display: 'flex',
      borderRadius: '13px',
      alignItems: 'center',
      marginRight: '8px',
    },
    filter: {
      fontSize: '12px',
      color: '#3A4445',
      fontWeight: 400,
      margin: 0,
    },
    value: {
      paddingLeft: '4px',
      fontSize: '12px',
      color: '#3A4445',
      fontWeight: 600,
      margin: 0,
    },
    icon: {
      fill: '#3A4445',
      width: '9px',
      height: '9px',
      margin: '0 6px',
    },
    iconContainer: {
      padding: 0,
    },
  })
);

type PillProps = {
  filter: string;
  value: string;
  onRemoveFilter: () => void;
};

export default function Pill({ filter, value, onRemoveFilter }: PillProps): JSX.Element {
  const classes = useStyles();
  return (
    <div className={classes.pill}>
      <p className={classes.filter}>{filter}:</p>
      <p className={classes.value}>{value}</p>
      <IconButton onClick={onRemoveFilter} className={classes.iconContainer}>
        <Icon name='close' className={classes.icon} />
      </IconButton>
    </div>
  );
}
