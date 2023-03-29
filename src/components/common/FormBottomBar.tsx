import { AppBar, Theme } from '@mui/material';
import React from 'react';
import Button from './button/Button';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
  isDesktop: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  bottomBar: {
    background:
      `linear-gradient(to right, ${theme.palette.TwClrBaseGray025}00,` +
      `${theme.palette.TwClrBaseGray025}80, ${theme.palette.TwClrBaseGray025}80,` +
      `${theme.palette.TwClrBaseGray025}00)`,
    backdropFilter: 'blur(16px)',
    borderTop: '1px solid',
    borderImage:
      `linear-gradient(to right, ${theme.palette.TwClrBaseGray300}00,` +
      `${theme.palette.TwClrBaseGray300}FF, ${theme.palette.TwClrBaseGray300}FF,` +
      `${theme.palette.TwClrBaseGray300}FF, ${theme.palette.TwClrBaseGray300}00) 1`,
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
  rightButtons: {
    marginTop: (props: StyleProps) => (props.isMobile ? theme.spacing(1) : 'auto'),
    marginRight: theme.spacing(1),
  },
  rightButtonGroup: {
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column-reverse' : 'row'),
  },
}));

export interface FormButton {
  id: string;
  text: string;
  disabled: boolean;
  onClick: () => void;
  buttonPriority?: 'primary' | 'secondary';
  buttonType?: 'passive' | 'productive' | 'destructive';
}

export interface Props {
  cancelID: string;
  saveID: string;
  onCancel: () => void;
  cancelButtonText?: string;
  saveButtonText?: string;
  saveDisabled?: boolean;
  onSave: () => void;
  additionalLeftButtons?: FormButton[];
  additionalRightButtons?: FormButton[];
}

export default function FormBottomBar({
  cancelID,
  saveID,
  onCancel,
  cancelButtonText,
  saveButtonText,
  saveDisabled,
  onSave,
  additionalLeftButtons,
  additionalRightButtons,
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
        id={cancelID || 'cancelBottomBar'}
        size='medium'
        label={cancelButtonText || strings.CANCEL}
        onClick={onCancel}
        priority='secondary'
        type='passive'
        className={classes.button}
      />
      <div className={classes.rightButtonGroup}>
        {additionalRightButtons &&
          additionalRightButtons.map((btn) => (
            <Button
              id={btn.id}
              key={btn.id}
              priority={btn.buttonPriority}
              type={btn.buttonType}
              size='medium'
              label={btn.text}
              onClick={btn.onClick}
              className={classes.rightButtons}
              disabled={btn.disabled}
            />
          ))}
        <Button
          id={saveID || 'saveBottomBar'}
          size='medium'
          label={saveButtonText || strings.SAVE}
          onClick={onSave}
          className={classes.button}
          disabled={saveDisabled}
        />
      </div>
    </AppBar>
  );
}
