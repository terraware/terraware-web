import { createStyles, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import Tour from 'reactour';
import strings from '../../strings';
import theme from '../../theme';
import OnboardingButtons from './OnboardingButtons';
import Step from './Step';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    helper: {
      maxWidth: '560px !important',
      padding: '0 !important',
      borderRadius: theme.spacing(1),
    },
  })
);

export interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Onboarding({ isOpen, onClose }: Props): JSX.Element {
  const classes = useStyles();

  const steps = [
    {
      selector: '#tab-summary',
      style: { backgroundColor: theme.palette.primary.main },
      content: () => (
        <Step
          title={strings.ONBOARDING_TITLE_STEP_1}
          description={strings.ONBOARDING_DESCRIPTION_STEP_1}
          stepNumber={1}
        />
      ),
    },
    {
      selector: '#tab-database',
      style: { backgroundColor: theme.palette.primary.main },
      content: () => (
        <Step
          title={strings.ONBOARDING_TITLE_STEP_2}
          description={strings.ONBOARDING_DESCRIPTION_STEP_2}
          stepNumber={2}
        />
      ),
    },
    {
      selector: '#help-button',
      style: { backgroundColor: theme.palette.primary.main },
      content: () => (
        <Step
          title={strings.ONBOARDING_TITLE_STEP_3}
          description={strings.ONBOARDING_DESCRIPTION_STEP_3}
          stepNumber={3}
        />
      ),
    },
    {
      selector: '#notifications-button',
      style: { backgroundColor: theme.palette.primary.main },
      content: () => (
        <Step
          title={strings.ONBOARDING_TITLE_STEP_4}
          description={strings.ONBOARDING_DESCRIPTION_STEP_4}
          stepNumber={4}
        />
      ),
    },
    {
      selector: '#newAccession',
      style: { backgroundColor: theme.palette.primary.main },
      content: () => (
        <Step
          title={strings.ONBOARDING_TITLE_STEP_5}
          description={strings.ONBOARDING_DESCRIPTION_STEP_5}
          stepNumber={5}
        />
      ),
    },
  ];

  return (
    <Tour
      steps={steps}
      isOpen={isOpen}
      onRequestClose={onClose}
      CustomHelper={OnboardingButtons}
      closeWithMask={false}
      className={classes.helper}
      showArrow={true}
      arrowSize={10}
    />
  );
}
