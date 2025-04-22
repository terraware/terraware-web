import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { getImagePath } from 'src/utils/images';

type ProjectProfileImageProps = {
  projectId: number;
  imageValueId: number;
  alt: string;
};

const ProjectProfileImage = ({ projectId, imageValueId, alt }: ProjectProfileImageProps) => {
  const theme = useTheme();
  return (
    <Grid item md={6} maxHeight={400} paddingX={theme.spacing(1)}>
      <Box maxHeight={400} overflow={'clip'} borderRadius={theme.spacing(1)}>
        <img
          src={getImagePath(projectId, imageValueId)}
          alt={alt}
          style={{ width: '100%', height: '100%', borderRadius: theme.spacing(1) }}
        />
      </Box>
    </Grid>
  );
};

export default ProjectProfileImage;
