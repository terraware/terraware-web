import React, { type JSX } from 'react';

import { Step, StepLabel, Stepper, useTheme } from '@mui/material';

type SpeciesCheckStepperProps = {
  steps: string[];
  activeStep: number;
};

const SpeciesCheckStepper = ({ steps, activeStep }: SpeciesCheckStepperProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Stepper activeStep={activeStep} sx={{ margin: theme.spacing(1, 0, 3) }}>
      {steps.map((label, index) => (
        <Step key={label}>
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
                fontWeight: index === activeStep ? 600 : 400,
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
