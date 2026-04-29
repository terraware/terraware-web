import React, { useState } from 'react';

import { TextField, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

type TreeNoteModalProps = {
  description: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

const TreeNoteModal = ({ description, onClose, onSave }: TreeNoteModalProps) => {
  const { strings } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleCancel = () => {
    if (isEditing) {
      setValue(description);
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.NOTES}
      size='medium'
      middleButtons={
        isEditing
          ? [
              <Button
                id='cancelNote'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                onClick={handleCancel}
                size='medium'
                key='button-cancel'
              />,
              <Button id='saveNote' label={strings.SAVE} onClick={handleSave} size='medium' key='button-save' />,
            ]
          : [
              <Button
                id='editNote'
                label={strings.EDIT}
                onClick={() => setIsEditing(true)}
                size='medium'
                key='button-edit'
              />,
            ]
      }
    >
      {isEditing ? (
        <TextField autoFocus fullWidth multiline minRows={3} value={value} onChange={(e) => setValue(e.target.value)} />
      ) : (
        <Typography sx={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{value}</Typography>
      )}
    </DialogBox>
  );
};

export default TreeNoteModal;
