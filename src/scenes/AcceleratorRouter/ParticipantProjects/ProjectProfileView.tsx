import React from 'react';

import { Box, Typography } from '@mui/material';

import { useParticipantProjectData } from './ParticipantProjectContext';

const ProjectProfileView = () => {
  const { participantProject } = useParticipantProjectData();

  return (
    <Box paddingLeft={1}>
      <Typography fontSize={'24px'} fontWeight={600}>
        {participantProject?.dealName}
      </Typography>
    </Box>
  );
};

export default ProjectProfileView;
