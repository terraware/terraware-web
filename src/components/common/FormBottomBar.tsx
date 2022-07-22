import { AppBar, Theme } from '@mui/material';
import React from 'react';
import Button from './button/Button';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  bottomBar: {
    filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.2))',
    background: '#ffffff',
    boxShadow: 'none',
    flexDirection: 'row',
    justifyContent: 'space-between',
    display: 'flex',
    padding: '16px 24px',
    '&.desktop': {
      width: 'calc(100% - 200px)',
    },
    '&.mobile': {
      flexDirection: 'column-reverse',
      paddingBottom: theme.spacing(5),
    },
    zIndex: 1000,
  },
  buttonMobile: {
    marginTop: theme.spacing(1),
  },
}));

export interface Props {
  onCancel: () => void;
  onSave: () => void;
}

export default function FormBottomBar({ onCancel, onSave }: Props): JSX.Element {
  const classes = useStyles();
  const { isMobile, isDesktop } = useDeviceInfo();

  return (
    <AppBar
      position='fixed'
      color='primary'
      style={{ top: 'auto', bottom: 0, right: 'auto' }}
      className={`${classes.bottomBar} ${isDesktop ? 'desktop' : ''} ${isMobile ? 'mobile' : ''}`}
    >
      <Button
        size='medium'
        label='Cancel'
        onClick={onCancel}
        priority='secondary'
        type='passive'
        className={isMobile ? classes.buttonMobile : ''}
      />
      <Button size='medium' label='Save' onClick={onSave} className={isMobile ? classes.buttonMobile : ''} />
    </AppBar>
  );
}
