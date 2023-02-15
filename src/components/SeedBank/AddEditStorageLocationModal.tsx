import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from '../common/Textfield/Textfield';
import { PartialStorageLocation } from 'src/types/Facility';

export interface AddEditStorageLocationProps {
  open: boolean;
  selectedStorageLocation?: PartialStorageLocation;
  onEditStorageLocation: (location: PartialStorageLocation) => void;
  onAddStorageLocation: (name: string) => void;
  onClose: () => void;
  storageLocations: PartialStorageLocation[];
}

export default function AddEditStorageLocationModal(props: AddEditStorageLocationProps): JSX.Element {
  const { open, selectedStorageLocation, onEditStorageLocation, onAddStorageLocation, onClose, storageLocations } =
    props;
  const [name, setName] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  useEffect(() => {
    setName(selectedStorageLocation?.name ?? '');
  }, [selectedStorageLocation]);

  const saveStorageLocation = () => {
    if (!name) {
      setErrorText(strings.REQUIRED_FIELD);
      return;
    }

    if (
      storageLocations
        .filter((location) => location.id !== selectedStorageLocation?.id)
        .find((location) => location.name === name)
    ) {
      setErrorText(strings.SUB_LOCATION_EXISTS);
      return;
    }

    if (selectedStorageLocation) {
      if (name !== selectedStorageLocation.name) {
        onEditStorageLocation({ ...selectedStorageLocation, name });
      }
    } else {
      onAddStorageLocation(name);
    }

    setName('');
    onClose();
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={selectedStorageLocation ? strings.SUB_LOCATION_DETAILS : strings.ADD_SUB_LOCATION}
      size='small'
      middleButtons={[
        <Button
          id='cancelStorageLocation'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id={selectedStorageLocation ? 'editStorageLocation' : 'saveStorageLocation'}
          onClick={saveStorageLocation}
          label={strings.SAVE}
          key='button-2'
        />,
      ]}
    >
      <Box textAlign='left'>
        <TextField
          id='storage-location-name'
          label={strings.NAME}
          type='text'
          onChange={(value: any) => {
            if (value?.length) {
              setErrorText('');
            }
            setName(value ?? '');
          }}
          value={name}
          errorText={errorText}
          autoFocus={true}
        />
      </Box>
    </DialogBox>
  );
}
