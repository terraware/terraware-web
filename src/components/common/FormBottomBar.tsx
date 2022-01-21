import { AppBar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Button from './button/Button';

const useStyles = makeStyles((theme) =>
  createStyles({
    bottomBar: {
      filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.2))',
      background: '#ffffff',
      boxShadow: 'none',
      flexDirection: 'row',
      justifyContent: 'space-between',
      display: 'flex',
      padding: '16px 24px',
      width: 'calc(100% - 200px)',
    },
  })
);

export interface Props {
  onCancel: () => void;
  onSave: () => void;
}

export default function FormBottomBar({ onCancel, onSave }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <AppBar
      position='fixed'
      color='primary'
      style={{ top: 'auto', bottom: 0, right: 'auto' }}
      className={classes.bottomBar}
    >
      <Button label='Cancel' onClick={onCancel} priority='secondary' type='passive' />
      <Button label='Save' onClick={onSave} />
    </AppBar>
  );
}
