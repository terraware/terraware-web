import { Chip, createStyles, makeStyles, Theme } from '@material-ui/core';
import React, { ReactNode } from 'react';
import { Controls } from 'reactour';
import strings from '../../strings';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    onboarding: {
      padding: '24px 30px',
      boxShadow: '0 0.5em 3em rgba(0, 0, 0, 0.3)',
      color: theme.palette.common.white,
      background: theme.palette.primary.main,
      maxWidth: '560px',
      borderRadius: theme.spacing(1),
    },
    onboardingControls: {
      flexDirection: 'row-reverse',
    },
    nextStep: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.neutral[800],
      '&:hover, &:focus': {
        backgroundColor: theme.palette.common.white,
      },
    },
    skipTour: {
      textDecoration: 'underline',
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  })
);

interface Props {
  current: number;
  content: ReactNode;
  totalSteps: number;
  gotoStep: (step: number) => void;
  close: () => void;
}

export default function OnboardingButtons({
  current,
  content,
  totalSteps,
  gotoStep,
  close,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.onboarding}>
      {content}
      <Controls
        data-tour-elem='controls'
        className={classes.onboardingControls}
      >
        {current === totalSteps - 1 && (
          <Chip
            id='nextStep'
            label={strings.ONBOARDING_LAST_STEP}
            clickable
            color='default'
            className={classes.nextStep}
            onClick={close}
          />
        )}
        {current !== totalSteps - 1 && (
          <>
            <Chip
              id='nextStep'
              label={strings.ONBOARDING_NEXT_STEP}
              clickable
              color='default'
              className={classes.nextStep}
              onClick={() => gotoStep(current + 1)}
            />
            <Chip
              id='skip'
              label={strings.SKIP_ONBOARDING}
              clickable
              color='primary'
              className={classes.skipTour}
              onClick={close}
            />
          </>
        )}
      </Controls>
    </div>
  );
}
