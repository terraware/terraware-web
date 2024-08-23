import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { Badge } from '@terraware/web-components';

import { useCohorts } from 'src/hooks/useCohorts';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useProjectData } from 'src/providers/Project/ProjectContext';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Module } from 'src/types/Module';

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
  const { activeModules, modules, currentParticipant, currentParticipantProject } = useParticipantData();
  const [requestId, setRequestId] = useState('');
  const projectModuleList = useAppSelector(selectProjectModuleList(requestId));
  const dispatch = useAppDispatch();
  const [projectModules, setProjectModules] = useState<Module[] | undefined>();
  const useDataFromParticipantData = activeModules && currentParticipant && modules;

  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);
  const { selectedCohort } = useCohorts(cohortId);
  const { projectId } = useProjectData();

  useEffect(() => {
    if (currentParticipantProject) {
      const request = dispatch(requestListModules(currentParticipantProject.id));
      setRequestId(request.requestId);
    } else {
      if (projectId) {
        const request = dispatch(requestListModules(projectId));
        setRequestId(request.requestId);
      }
    }
  }, [currentParticipantProject]);

  useEffect(() => {
    if (projectModuleList?.status === 'success') {
      setProjectModules(projectModuleList.data);
    }
  }, [projectModuleList]);

  const modulesToUse = useDataFromParticipantData ? modules : projectModules;
  // Find first active index. TODO upgrade stepper to handle multiple active steps
  const activeIndex = useDataFromParticipantData
    ? modules?.findIndex((module) => activeModules?.find((active) => module.id === active.id) != undefined)
    : projectModules?.findIndex((module) => module.isActive) ||
      selectedCohort?.modules.findIndex((module) => module.isActive);

  return (
    <Box maxWidth={'206px'}>
      {(currentParticipant?.cohortPhase || currentParticipantProject?.cohortPhase || selectedCohort?.phase) && (
        <Box sx={{ marginBottom: '24px', paddingRight: '16px' }}>
          <Badge
            label={
              useDataFromParticipantData
                ? currentParticipant.cohortPhase || ''
                : currentParticipantProject?.cohortPhase || selectedCohort?.phase || ''
            }
          />
        </Box>
      )}

      <Box sx={{ width: 180 }}>
        <Stepper activeStep={activeIndex} orientation='vertical'>
          {modulesToUse
            ? modulesToUse.map((module, index) => (
                <Step key={module.id}>
                  <StepLabel
                    icon={<AltStepIcon activeStep={activeIndex || -1} index={index} />}
                    sx={{ fontWeight: 600, '.MuiStepLabel-label.Mui-disabled': { fontWeight: 600 } }}
                  >
                    {module.title}
                    <br />
                    <Typography component='span' style={{ fontSize: '14px', fontWeight: 400 }}>
                      {module.name}
                    </Typography>
                  </StepLabel>
                </Step>
              ))
            : selectedCohort?.modules.map((module, index) => (
                <Step key={module.id}>
                  <StepLabel
                    icon={<AltStepIcon activeStep={activeIndex || -1} index={index} />}
                    sx={{ fontWeight: 600, '.MuiStepLabel-label.Mui-disabled': { fontWeight: 600 } }}
                  >
                    {module.title}
                  </StepLabel>
                </Step>
              ))}
        </Stepper>
      </Box>
    </Box>
  );
};

export default ModuleTimeline;
