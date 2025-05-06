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
    <Grid item md={6} sx={{ paddingX: theme.spacing(1) }}>
      <Box
        sx={{
          overflow: 'hidden',
          borderRadius: theme.spacing(1),
          position: 'relative',
          width: '100%',
          paddingTop: '66.67%', // 3:2 ratio
        }}
      >
        <Box
          component={'img'}
          src={getImagePath(projectId, imageValueId)}
          alt={alt}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: theme.spacing(1),
          }}
        />
        {label && (
          <Box
            sx={{
              height: 'max-content',
              width: 'max-content',
              position: 'absolute',
              right: theme.spacing(2),
              bottom: theme.spacing(2),
              zIndex: 1000,
            }}
          >
            {label}
          </Box>
        )}
      </Box>
    </Grid>
  );
};

export default ProjectProfileImage;
