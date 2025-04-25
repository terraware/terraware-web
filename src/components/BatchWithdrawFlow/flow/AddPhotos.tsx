import React, { useState } from 'react';

import { Container, useTheme } from '@mui/material';

import PageForm from 'src/components/common/PageForm';
import SelectPhotos from 'src/components/common/Photos/SelectPhotos';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type AddPhotosProps = {
  onNext: (photos: File[]) => void;
  onCancel: () => void;
  saveText: string;
};
export default function AddPhotos(props: AddPhotosProps): JSX.Element {
  const { onNext, onCancel, saveText } = props;
  const [photos, setPhotos] = useState<File[]>([]);
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const onPhotosChanged = (photosList: File[]) => {
    setPhotos(photosList);
  };

  const onNextHandler = async () => {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await onNext(photos);
  };

  return (
    <PageForm
      cancelID='cancelAddPhotos'
      saveID='saveAddPhotos'
      onCancel={onCancel}
      onSave={onNextHandler}
      saveButtonText={saveText}
    >
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          margin: '0 auto',
          width: isMobile ? '100%' : '700px',
          paddingLeft: theme.spacing(isMobile ? 1 : 4),
          paddingRight: theme.spacing(isMobile ? 1 : 4),
          paddingTop: theme.spacing(5),
        }}
      >
        <SelectPhotos
          onPhotosChanged={onPhotosChanged}
          title={strings.ADD_PHOTOS}
          description={strings.ADD_PHOTOS_DESCRIPTION_OPTIONAL}
          multipleSelection={true}
        />
      </Container>
    </PageForm>
  );
}
