import React from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { Badge } from '@terraware/web-components';

type AltStepIconProps = {
  activeStep: number;
  index: number;
};

const AltStepIcon = ({ activeStep, index }: AltStepIconProps) => {
  const theme = useTheme();
  const stepNumber = index + 1;

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: index === activeStep ? theme.palette.TwClrBaseGreen500 : theme.palette.TwClrBaseGray300,
        borderRadius: '50%',
        color: theme.palette.TwClrBaseWhite,
        display: 'flex',
        height: 24,
        justifyContent: 'center',
        width: 24,
      }}
    >
      <Typography variant='caption'>{stepNumber}</Typography>
    </Box>
  );
};

type ModuleTimelineProps = {
  activeStep: number;
  steps: Array<{ label: string; description: string }>;
  title: string;
};

const ModuleTimeline = ({ activeStep, steps, title }: ModuleTimelineProps) => {
  return (
    <Box>
      <Box sx={{ marginBottom: '24px', paddingRight: '16px' }}>
        <Badge label={title} />
      </Box>

      <Box sx={{ width: 180 }}>
        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={<AltStepIcon activeStep={activeStep} index={index} />}
                sx={{ fontWeight: 600, '.MuiStepLabel-label.Mui-disabled': { fontWeight: 600 } }}
              >
                {step.label}
                <br />
                <Typography component='span' style={{ fontSize: '14px', fontWeight: 400 }}>
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
};

export default ModuleTimeline;
