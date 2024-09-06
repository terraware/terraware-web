import React from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { Badge } from '@terraware/web-components';

import { CohortPhaseType } from 'src/types/Cohort';
import { Module } from 'src/types/Module';

type AltStepIconProps = {
  isActive: boolean;
  index: number;
};

const AltStepIcon = ({ isActive, index }: AltStepIconProps) => {
  const theme = useTheme();
  const stepNumber = index + 1;

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: isActive ? theme.palette.TwClrBaseGreen500 : theme.palette.TwClrBaseGray300,
        borderRadius: '50%',
        color: theme.palette.TwClrBaseWhite,
        display: 'flex',
        height: 24,
        justifyContent: 'center',
        width: 24,
      }}
    >
      <Typography variant='caption' sx={{ fontSize: '14px' }}>
        {stepNumber}
      </Typography>
    </Box>
  );
};

export type ModuleTimelineProps = {
  cohortPhase?: CohortPhaseType;
  modules: Module[];
};

const ModuleTimeline = ({ cohortPhase, modules }: ModuleTimelineProps) => {
  return (
    <Box maxWidth={'206px'}>
      <Box sx={{ marginBottom: '24px', paddingRight: '16px' }}>{cohortPhase && <Badge label={cohortPhase} />}</Box>

      <Box sx={{ width: 180 }}>
        <Stepper orientation='vertical'>
          {(modules ?? []).map((module, index) => (
            <Step key={module.id} active={module.isActive}>
              <StepLabel
                icon={<AltStepIcon isActive={module.isActive} index={index} />}
                sx={{ fontWeight: 600, '.MuiStepLabel-label.Mui-disabled': { fontWeight: 600 } }}
              >
                {module.title}
                <br />
                <Typography component='span' style={{ fontSize: '14px', fontWeight: 400 }}>
                  {module.name}
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
