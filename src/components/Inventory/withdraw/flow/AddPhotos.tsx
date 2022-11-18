import { Typography } from '@mui/material';
import React from 'react';
import TfMain from 'src/components/common/TfMain';
import { ServerOrganization } from 'src/types/Organization';

type AddPhotosProps = {
  organization: ServerOrganization;
  onNext: () => void;
};
export default function AddPhotos(props: AddPhotosProps): JSX.Element {
  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold' }}>
        PHOTOS
      </Typography>
    </TfMain>
  );
}
