import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { getImagePath } from 'src/utils/images';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type ProjectProfileImageProps = {
  projectId: number;
  imageValueId: number;
  alt: string;
  label?: React.ReactNode;
};

const ProjectProfileImage = ({ projectId, imageValueId, alt, label }: ProjectProfileImageProps) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useDeviceInfo();

  return (
    <Grid item md={isMobile || isTablet ? 12 : 6} sx={{ padding: theme.spacing(isMobile || isTablet ? 1 : 0, 1) }}>
      <Box
        sx={{
          overflow: 'hidden',
          borderRadius: theme.spacing(1),
          position: 'relative',
          width: '100%',
          aspectRatio: '3/2',
        }}
      >
        <Box
          component={'img'}
          src={getImagePath(projectId, imageValueId)}
          alt={alt}
          sx={{
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
