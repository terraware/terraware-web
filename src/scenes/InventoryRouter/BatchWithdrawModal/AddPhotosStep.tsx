import React, { type JSX } from 'react';

import { Box } from '@mui/material';

import SelectPhotos from 'src/components/common/Photos/SelectPhotos';

export type AddPhotosStepProps = {
  photos: File[];
  onPhotosChanged: (files: File[]) => void;
};

const AddPhotosStep = ({ onPhotosChanged }: AddPhotosStepProps): JSX.Element => {
  return (
    <Box>
      <SelectPhotos onPhotosChanged={onPhotosChanged} multipleSelection />
    </Box>
  );
};

export default AddPhotosStep;
