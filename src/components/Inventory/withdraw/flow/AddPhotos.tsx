import React, { useState } from 'react';
import { Container, useTheme } from '@mui/material';
import strings from 'src/strings';
import SelectPhotos, { ErrorType } from 'src/components/common/SelectPhotos';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageForm from 'src/components/common/PageForm';
import { NurseryWithdrawalPurposes } from 'src/api/types/batch';

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
  const [photosRequired] = useState<boolean>(withdrawalPurpose === NurseryWithdrawalPurposes.OUTPLANT);
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
    <PageForm onCancel={onCancel} onSave={onNextHandler} saveButtonText={saveText}>
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
          title={photosRequired ? strings.ADD_PHOTOS_REQUIRED : strings.ADD_PHOTOS}
          description={
            photosRequired
              ? [strings.ADD_PHOTOS_REQUIRED_OUTPLANT, strings.ADD_PHOTOS_DESCRIPTION]
              : strings.ADD_PHOTOS_DESCRIPTION_OPTIONAL
          }
          multipleSelection={true}
          error={error}
        />
      </Container>
    </PageForm>
  );
}
