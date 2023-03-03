import React from 'react';
import { Container } from '@mui/material';
import SelectPhotos from 'src/components/common/SelectPhotos';

type UploadPhotosProps = {
  onPhotosChanged: (photos: File[]) => void;
};
export default function UploadPhotos(props: UploadPhotosProps): JSX.Element {
  const { onPhotosChanged } = props;

  return (
    <Container maxWidth={false}>
      <SelectPhotos onPhotosChanged={onPhotosChanged} multipleSelection={true} />
    </Container>
  );
}
