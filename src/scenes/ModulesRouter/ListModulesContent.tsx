import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import ModuleEntry from './ModuleEntry';

export default function ListModulesContent(): JSX.Element {
  const { currentAcceleratorProject, modules } = useParticipantData();
  const theme = useTheme();
  return (
    <Box paddingX={theme.spacing(2)}>
      {currentAcceleratorProject &&
        modules?.map((module, index) => (
          <ModuleEntry index={index} key={index} module={module} projectId={currentAcceleratorProject?.id} />
        ))}
    </Box>
  );
}
