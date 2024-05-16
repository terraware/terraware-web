import React from 'react';

import { Box } from '@mui/material';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import ModuleEntry from './ModuleEntry';

export default function ListModulesContent(): JSX.Element {
  const { currentParticipantProject, modules } = useParticipantData();
  return (
    <Box>
      {currentParticipantProject &&
        modules?.map((module, index) => (
          <ModuleEntry index={index} key={index} module={module} projectId={currentParticipantProject?.id} />
        ))}
    </Box>
  );
}
