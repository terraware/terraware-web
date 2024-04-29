import React from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { Badge } from '@terraware/web-components';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

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
      <Typography variant='caption' sx={{ fontSize: '14px' }}>
        {stepNumber}
      </Typography>
    </Box>
  );
};

const ModuleTimeline = () => {
  const { currentModule, modules, currentParticipant, currentParticipantProject } = useParticipantData();
  console.log(
    'currentModule, currentParticipant, currentParticipantProject',
    currentModule,
    modules,
    currentParticipant,
    currentParticipantProject
  );

  if (!(currentModule && currentParticipant && modules)) {
    return null;
  }

  const activeIndex = modules.findIndex((module) => module.id === currentModule.id);

  return (
    <Box maxWidth={'206px'}>
      {currentParticipant.cohortPhase && (
        <Box sx={{ marginBottom: '24px', paddingRight: '16px' }}>
          <Badge label={currentParticipant.cohortPhase || ''} />
        </Box>
      )}

      <Box sx={{ width: 180 }}>
        <Stepper activeStep={activeIndex} orientation='vertical'>
          {modules.map((module, index) => (
            <Step key={module.id}>
              <StepLabel
                icon={<AltStepIcon activeStep={activeIndex} index={index} />}
                sx={{ fontWeight: 600, '.MuiStepLabel-label.Mui-disabled': { fontWeight: 600 } }}
              >
                {strings.formatString(strings.MODULE_NUMBER, `${module.number}`) as string}
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
