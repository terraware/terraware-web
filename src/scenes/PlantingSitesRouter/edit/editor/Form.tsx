import React, { CSSProperties, type JSX, useMemo } from 'react';

import { Box, Step, StepLabel, Stepper, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { SiteEditStep } from 'src/types/PlantingSite';

type OptionalStep = {
  completed: boolean;
};

export type PlantingSiteStep = {
  type: SiteEditStep;
  label: string;
  // to govern optional steps and their status
  optional?: OptionalStep;
};

export type FormProps = {
  children: React.ReactNode;
  className?: string;
  currentStep: SiteEditStep;
  steps: PlantingSiteStep[];
  style?: CSSProperties;
};

export default function Form({ children, className, currentStep, steps, style }: FormProps): JSX.Element {
  const theme = useTheme();

  const currentStepIndex = useMemo<number>(() => {
    let stepIndex = 0;

    steps.forEach((step: PlantingSiteStep, index: number) => {
      if (currentStep === step.type) {
        stepIndex = index;
      }
    });

    return stepIndex;
  }, [currentStep, steps]);

  return (
    <Box className={className} style={style}>
      <Stepper activeStep={currentStepIndex} sx={{ margin: theme.spacing(3, 5, 0) }}>
        {steps.map((step: PlantingSiteStep, index: number) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};

          if (step.optional) {
            stepProps.completed = step.optional.completed;
            labelProps.optional = <Typography variant='caption'>{strings.OPTIONAL}</Typography>;
          }

          return (
            <Step key={index} {...stepProps}>
              <StepLabel
                {...labelProps}
                sx={{
                  '.MuiStepIcon-root.Mui-active, .MuiStepIcon-root.Mui-completed': {
                    fill: theme.palette.TwClrTxtBrand,
                  },
                  '.MuiStepLabel-label': {
                    fontSize: '16px',
                    fontWeight: 400,
                    color: theme.palette.TwClrTxt,
                  },
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {children}
    </Box>
  );
}
