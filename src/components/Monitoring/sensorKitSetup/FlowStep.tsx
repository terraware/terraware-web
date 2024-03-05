import React from 'react';

import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ErrorBox from '../../common/ErrorBox/ErrorBox';
import Expandable from '../../common/Expandable';
import Icon from '../../common/icon/Icon';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  setupTitle: {
    fontWeight: 'bold',
    fontSize: '18px',
    lineHeight: '28px',
  },
  flowContent: {
    marginTop: theme.spacing(2),
  },
  flowFooter: {
    display: 'flex',
    marginTop: theme.spacing(2),
    alignItems: 'end',
  },
  flowFooterError: {
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  errorBox: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  button: {
    marginLeft: (props: StyleProps) => theme.spacing(props.isMobile ? 1 : 3),
    marginBottom: '4px',
  },
}));

export type FlowError = {
  title?: string;
  text: string;
  buttonText?: string;
  onClick?: () => void;
};

type FlowStepProps = {
  flowState: string;
  title: string;
  active: boolean;
  completed: boolean | undefined;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerError?: boolean;
  showNext: boolean;
  disableNext?: boolean;
  buttonText?: string;
  onNext: () => void;
  flowError?: FlowError;
};

export default function FlowStep(props: FlowStepProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const {
    flowState,
    title,
    active,
    completed,
    children,
    footer,
    footerError,
    showNext,
    disableNext,
    buttonText,
    onNext,
    flowError,
  } = props;

  return (
    <Grid item xs={12} className={classes.gridItem}>
      <Expandable
        title={
          <div className={classes.titleContainer}>
            {completed && <Icon name='checkmark' className={classes.icon} />}
            <span className={classes.setupTitle}>{title}</span>
          </div>
        }
        opened={active}
        disabled={!active}
      >
        <div className={classes.flowContent}>
          {flowError !== undefined && <ErrorBox {...flowError} className={classes.errorBox} />}
          {children}
          <div className={classes.flowFooter + (footerError ? ' ' + classes.flowFooterError : '')}>
            <span>{footer}</span>
            {showNext && (
              <Button
                id={'flow-state-next-' + flowState}
                label={buttonText || strings.NEXT}
                onClick={onNext}
                priority='secondary'
                size='small'
                disabled={disableNext}
                className={footer === undefined ? '' : classes.button}
              />
            )}
          </div>
        </div>
      </Expandable>
    </Grid>
  );
}
