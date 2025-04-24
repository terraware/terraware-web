import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { getImagePath } from 'src/utils/images';

type ProjectProfileImageProps = {
  projectId: number;
  imageValueId: number;
  alt: string;
  label?: React.ReactNode;
};

const ProjectProfileImage = ({ projectId, imageValueId, alt, label }: ProjectProfileImageProps) => {
  const theme = useTheme();
  return (
    <Grid item md={6} maxHeight={400} paddingX={theme.spacing(1)}>
      <Box maxHeight={400} overflow={'clip'} borderRadius={theme.spacing(1)} position={'relative'}>
        <img
          src={getImagePath(projectId, imageValueId)}
          alt={alt}
          style={{ width: '100%', height: '100%', borderRadius: theme.spacing(1) }}
        />
        {label && (
          <div
            style={{
              height: 'max-content',
              width: 'max-content',
              position: 'absolute',
              right: theme.spacing(2),
              bottom: theme.spacing(2),
              zIndex: 1000,
            }}
          >
            {label}
          </div>
        )}
      </Box>
    </Grid>
  );
};

export default ProjectProfileImage;
