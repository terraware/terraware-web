import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import CurrentTimeline from './CurrentTimeline';
import ModuleEntry from './ModuleEntry';

export default function ListView(): JSX.Element {
  const theme = useTheme();

  const { currentParticipant, currentParticipantProject, participantProjects, setCurrentParticipantProject } = useParticipantData();

  const { goToModules } = useNavigateTo();

  const modules = useAppSelector(selectProjectModuleList(currentParticipantProject?.id ?? -1));

  // TODO - where will this be stored? Is this stored in the back end within another enum table?
  // Should we store it and localize it in the front end? Will it be stored somewhere an admin can edit it?
  // For now, I am hard coding it to get the UI done while we figure out where it belongs.
  const phaseDescription =
    'We have divided Phase 1 into a series of modules that will help you keep on track and ' +
    'provide resources like live workshops throughout your project. Each module has a specific timeframe, but you ' +
    'will need to review all deliverables over the course of Phase 1. A list of deliverables that you need to ' +
    'review is displayed in your To Do list on your home screen. Please login to Terraware regularly to check which ' +
    'deliverables are due or need review.';

  const options: DropdownItem[] = useMemo(
    () =>
      participantProjects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    [participantProjects]
  );

  const selectStyles = {
    arrow: {
      height: '32px',
    },
    input: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '32px',
    },
    inputContainer: {
      border: 0,
      backgroundColor: 'initial',
    },
  };

  return (
    <PageWithModuleTimeline title={strings.ALL_MODULES}>
      <Box sx={{ paddingBottom: 2 }}>
        <Dropdown
          onChange={(id) => {
            const projectId = +id;
            if (projectId != currentParticipantProject?.id) {
              setCurrentParticipantProject(projectId);
              goToModules(+projectId);
            }
          }}
          options={options}
          selectStyles={selectStyles}
          selectedValue={currentParticipantProject?.id}
        />
      </Box>

      <Card style={{ width: '100%' }}>
        <CurrentTimeline cohortPhase={currentParticipant?.cohortPhase} />

        <Box paddingY={theme.spacing(2)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
          <Typography>{phaseDescription}</Typography>
        </Box>

        {currentParticipantProject &&
          modules?.map((module, index) => (
            <ModuleEntry index={index} key={index} module={module} projectId={currentParticipantProject?.id} />
          ))}
      </Card>
    </PageWithModuleTimeline>
  );
}
