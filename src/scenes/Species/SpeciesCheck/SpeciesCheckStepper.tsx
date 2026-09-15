import React, { type JSX } from 'react';

import { Step, StepLabel, Stepper, useTheme } from '@mui/material';

type SpeciesCheckStepperProps = {
  steps: string[];
  activeStep: number;
  allComplete?: boolean;
};

const SpeciesCheckStepper = ({ steps, activeStep, allComplete = false }: SpeciesCheckStepperProps): JSX.Element => {
  const theme = useTheme();

  const effectiveActiveStep = allComplete ? steps.length : activeStep;
  const boldIndex = allComplete ? steps.length - 1 : activeStep;

  return (
    <Stepper activeStep={effectiveActiveStep} sx={{ margin: theme.spacing(1, 0, 3) }}>
      {steps.map((label, index) => (
        <Step key={label} completed={allComplete ? true : undefined}>
          <StepLabel
            sx={{
              '.MuiStepIcon-root': {
                fill: theme.palette.TwClrBgTertiary,
              },
              '.MuiStepIcon-root.Mui-completed': {
                fill: theme.palette.TwClrTxtBrand,
              },
              '.MuiStepIcon-root.Mui-active': {
                fill: theme.palette.TwClrIcnSecondary,
              },
              '.MuiStepLabel-label': {
                fontSize: '14px',
                fontWeight: index === boldIndex ? 600 : 400,
                color: theme.palette.TwClrTxt,
              },
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default SpeciesCheckStepper;
