import { AppBar, Theme } from '@mui/material';
import React from 'react';
import Button from './button/Button';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
  isDesktop: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  bottomBar: {
    filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.2))',
    background: theme.palette.TwClrBg,
    boxShadow: 'none',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column-reverse' : 'row'),
    padding: (props: StyleProps) => (props.isDesktop ? '16px 24px' : `16px 24px ${theme.spacing(5)}`),
    width: (props: StyleProps) => (props.isDesktop ? 'calc(100% - 200px)' : '100%'),
    zIndex: 1000,
  },
  button: {
    marginTop: (props: StyleProps) => (props.isMobile ? theme.spacing(1) : 'auto'),
  },
}));

export interface Props {
  onCancel: () => void;
  onSave: () => void;
  cancelButtonText?: string;
  saveButtonText?: string;
  saveDisabled?: boolean;
}

export default function FormBottomBar({
  onCancel,
  onSave,
  cancelButtonText,
  saveButtonText,
  saveDisabled,
}: Props): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isMobile, isDesktop });

  return (
    <AppBar
      position='fixed'
      color='primary'
      style={{ top: 'auto', bottom: 0, right: 'auto', left: isDesktop ? 'auto' : 0 }}
      className={classes.bottomBar}
    >
      <Button
        size='medium'
        label={cancelButtonText || 'Cancel'}
        onClick={onCancel}
        priority='secondary'
        type='passive'
        className={classes.button}
      />
      <Button
        size='medium'
        label={saveButtonText || 'Save'}
        onClick={onSave}
        className={classes.button}
        disabled={saveDisabled}
      />
    </AppBar>
  );
}
