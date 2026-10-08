import React, { CSSProperties, type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Stepper } from '@terraware/web-components';

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
      <Stepper activeStep={currentStepIndex} steps={steps} sx={{ margin: theme.spacing(3, 5, 0) }} />
      {children}
    </Box>
  );
}
