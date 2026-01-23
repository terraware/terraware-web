import React, { type JSX, useEffect, useState } from 'react';

import { Box } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { PartialSubLocation } from 'src/types/Facility';

export interface AddEditSubLocationProps {
  open: boolean;
  selectedSubLocation?: PartialSubLocation;
  onEditSubLocation: (location: PartialSubLocation) => void;
  onAddSubLocation: (name: string) => void;
  onClose: () => void;
  subLocations: PartialSubLocation[];
}

export default function AddEditSubLocationModal(props: AddEditSubLocationProps): JSX.Element {
  const { open, selectedSubLocation, onEditSubLocation, onAddSubLocation, onClose, subLocations } = props;
  const [name, setName] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  useEffect(() => {
    setName(selectedSubLocation?.name ?? '');
  }, [selectedSubLocation]);

  const saveSubLocation = () => {
    if (!name) {
      setErrorText(strings.REQUIRED_FIELD);
      return;
    }

    if (
      subLocations
        .filter((location) => location.id !== selectedSubLocation?.id)
        .find((location) => location.name === name)
    ) {
      setErrorText(strings.SUB_LOCATION_EXISTS);
      return;
    }

    if (selectedSubLocation) {
      if (name !== selectedSubLocation.name) {
        onEditSubLocation({ ...selectedSubLocation, name });
      }
    } else {
      onAddSubLocation(name);
    }

    setName('');
    onClose();
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={selectedSubLocation ? strings.SUB_LOCATION_DETAILS : strings.ADD_SUB_LOCATION}
      size='small'
      middleButtons={[
        <Button
          id='cancelSubLocation'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id={selectedSubLocation ? 'editSubLocation' : 'saveSubLocation'}
          onClick={saveSubLocation}
          label={selectedSubLocation ? strings.UPDATE : strings.ADD}
          key='button-2'
        />,
      ]}
    >
      <Box textAlign='left'>
        <TextField
          id='sub-location-name'
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
