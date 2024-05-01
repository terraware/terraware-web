import React from 'react';

import { Box } from '@mui/material';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppSelector } from 'src/redux/store';

import ModuleEntry from './ModuleEntry';

export default function ListModulesContent(): JSX.Element {
  const { currentParticipantProject } = useParticipantData();

  const modules = useAppSelector(selectProjectModuleList(currentParticipantProject?.id ?? -1));

  return (
    <Box>
      {currentParticipantProject &&
        modules?.map((module, index) => (
          <ModuleEntry index={index} key={index} module={module} projectId={currentParticipantProject?.id} />
        ))}
    </Box>
  );
}
