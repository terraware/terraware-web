import React, { type JSX } from 'react';

import { Box } from '@mui/material';

import SelectPhotos from 'src/components/common/Photos/SelectPhotos';

type PhotosStepProps = {
  photos: File[];
  onPhotosChanged: (files: File[]) => void;
};

const PhotosStep = ({ onPhotosChanged }: PhotosStepProps): JSX.Element => (
  <Box>
    <SelectPhotos onPhotosChanged={onPhotosChanged} multipleSelection />
  </Box>
);

export default PhotosStep;
