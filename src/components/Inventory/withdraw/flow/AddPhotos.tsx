import React, { useCallback, useEffect, useState } from 'react';
import { Container, useTheme } from '@mui/material';
import strings from 'src/strings';
import SelectPhotos, { ErrorType } from 'src/components/common/SelectPhotos';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type AddPhotosProps = {
  withdrawalPurpose: string;
  onNext: (photos: File[]) => void;
  validate: boolean;
  onErrors: () => void;
};
export default function AddPhotos(props: AddPhotosProps): JSX.Element {
  const { withdrawalPurpose, onNext, validate, onErrors } = props;
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<ErrorType | undefined>();
  const [photosRequired] = useState<boolean>(withdrawalPurpose === 'Out Plant');
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const onPhotosChanged = (photosList: File[]) => {
    setPhotos(photosList);
    validateSelection();
  };

  const validateSelection = useCallback(() => {
    if (validate) {
      if (photosRequired && !photos.length) {
        onErrors();
        setError({ title: strings.REQUIRED_FIELD, text: strings.REQUIRED_FIELD }); // TODO, clean this up
      } else {
        setError(undefined);
        onNext(photos);
      }
    }
  }, [validate, photos, onNext, photosRequired, onErrors]);

  useEffect(() => {
    validateSelection();
  }, [validateSelection]);

  return (
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
  );
}
