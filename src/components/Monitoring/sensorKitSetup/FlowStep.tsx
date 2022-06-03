import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import React from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import Expandable from '../../common/Expandable';
import Icon from '../../common/icon/Icon';
import ErrorBox from '../../common/ErrorBox/ErrorBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    setupTitle: {
      fontWeight: 'bold',
      fontSize: '18px',
      lineHeight: '28px',
    },
    flowContent: {
      padding: `${theme.spacing(2)}px`,
    },
    flowFooter: {
      display: 'flex',
      marginTop: `${theme.spacing(2)}px`,
      justifyContent: 'space-between',
      alignItems: 'end',
    },
    flowFooterError: {
      alignItems: 'center',
    },
    icon: {
      marginRight: `${theme.spacing(1)}px`,
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    gridItem: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: `${theme.spacing(2)}px`,
    },
    errorBox: {
      width: '100%',
      marginBottom: `${theme.spacing(2)}px`,
    },
  })
);

export type FlowError = {
  title?: string;
  text?: string;
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
  const classes = useStyles();
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
          {(flowError?.title || flowError?.text) && (
            <ErrorBox text={flowError?.text || ''} title={flowError?.title || ''} className={classes.errorBox} />
          )}
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
              />
            )}
          </div>
        </div>
      </Expandable>
    </Grid>
  );
}
