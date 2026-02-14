import React from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { Badge } from '@terraware/web-components';

import { CohortModule } from 'src/types/Module';
import { PhaseType } from 'src/types/Phase';

type AltStepIconProps = {
  index: number;
  bgColor?: string;
};

const AltStepIcon = ({ index, bgColor }: AltStepIconProps) => {
  const theme = useTheme();
  const stepNumber = index + 1;

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: bgColor,
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
  cohortPhase?: PhaseType;
  modules: CohortModule[];
};

const ModuleTimeline = ({ cohortPhase, modules }: ModuleTimelineProps) => {
  const theme = useTheme();
  const now = new Date();
  const futureModules = modules?.filter((module) => new Date(module.endDate) > now);

  const soonestEndingModuleId = futureModules?.reduce((soonest, current) => {
    const soonestEndDate = new Date(soonest.endDate);
    const currentEndDate = new Date(current.endDate);
    return currentEndDate < soonestEndDate ? current : soonest;
  }, modules[0])?.id;

  const warningLabelStyles = {
    '.MuiStepLabel-label.Mui-active': { color: theme.palette.TwClrTxtWarning },
    '.MuiStepLabel-label.Mui-disabled': { color: theme.palette.TwClrTxtWarning, fontWeight: 600 },
  };

  return (
    <Box maxWidth={'206px'}>
      <Box sx={{ marginBottom: '24px', paddingRight: '16px' }}>{cohortPhase && <Badge label={cohortPhase} />}</Box>

      <Box sx={{ width: 180 }}>
        <Stepper orientation='vertical'>
          {(modules ?? []).map((module, index) => (
            <Step key={module.id} active={module.isActive}>
              <StepLabel
                icon={
                  <AltStepIcon
                    index={index}
                    bgColor={
                      soonestEndingModuleId === module.id
                        ? theme.palette.TwClrBgWarning
                        : module.isActive
                          ? theme.palette.TwClrBaseGreen500
                          : theme.palette.TwClrBaseGray300
                    }
                  />
                }
                sx={
                  soonestEndingModuleId === module.id
                    ? warningLabelStyles
                    : { fontWeight: 600, '.MuiStepLabel-label.Mui-disabled': { fontWeight: 600 } }
                }
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
