import React from 'react';
import Icon from 'src/components/common/icon/Icon';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: '#F2F4F5',
    border: '1px solid #708284',
    borderRadius: '8px',
    boxSizing: 'border-box',
    display: 'flex',
    margin: '12px auto',
    width: '584px',
  },
  message: {
    padding: '16px',
    paddingLeft: 0,
  },
  iconContainer: {
    padding: '18px',
  },
  iconBackground: {
    fill: '#708284',
  },
}));

type InfoBoxProps = {
  message: string;
};

export default function InfoBox({ message }: InfoBoxProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.iconContainer}>
        <Icon name='info' className={classes.iconBackground} />
      </div>
      <div className={classes.message}>{message}</div>
    </div>
  );
}
