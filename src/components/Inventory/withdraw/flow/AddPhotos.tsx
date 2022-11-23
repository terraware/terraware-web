import React, { useState } from 'react';
import { Container, useTheme } from '@mui/material';
import strings from 'src/strings';
import SelectPhotos, { ErrorType } from 'src/components/common/SelectPhotos';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FormBottomBar from 'src/components/common/FormBottomBar';

type AddPhotosProps = {
  withdrawalPurpose: string;
  onNext: (photos: File[]) => void;
  onCancel: () => void;
  saveText: string;
};
export default function AddPhotos(props: AddPhotosProps): JSX.Element {
  const { withdrawalPurpose, onNext, onCancel, saveText } = props;
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<ErrorType | undefined>();
  const [photosRequired] = useState<boolean>(withdrawalPurpose === 'Out Plant');
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const onPhotosChanged = (photosList: File[]) => {
    setPhotos(photosList);
  };

  const onNextHandler = () => {
    if (photosRequired && !photos.length) {
      setError({ title: strings.PHOTOS_REQUIRED, text: strings.PHOTOS_OUTPLANT_DESCRIPTION });
    } else {
      setError(undefined);
      onNext(photos);
    }
  };

  return (
    <>
      <Container
        maxWidth={false}
        sx={{
          margin: '0 auto',
          width: isMobile ? '100%' : '640px',
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          paddingTop: theme.spacing(5),
          paddingBottom: theme.spacing(5),
        }}
      >
        <SelectPhotos
          onPhotosChanged={onPhotosChanged}
          title={photosRequired ? strings.ADD_PHOTOS_REQUIRED : strings.ADD_PHOTOS}
          description={strings.ADD_PHOTOS_DESCRIPTION}
          multipleSelection={true}
          error={error}
        />
      </Container>
      <FormBottomBar onCancel={onCancel} onSave={onNextHandler} saveButtonText={saveText} />
    </>
  );
}
