import React, { useState } from 'react';

import { TextField } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

type TreeNoteModalProps = {
  description: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

const TreeNoteModal = ({ description, onClose, onSave }: TreeNoteModalProps) => {
  const { strings } = useLocalization();
  const [value, setValue] = useState(description);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.NOTES}
      size='medium'
      middleButtons={[
        <Button
          id='cancelNote'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-cancel'
        />,
        <Button id='saveNote' label={strings.SAVE} onClick={handleSave} size='medium' key='button-save' />,
      ]}
    >
      <TextField autoFocus fullWidth multiline minRows={3} value={value} onChange={(e) => setValue(e.target.value)} />
    </DialogBox>
  );
};

export default TreeNoteModal;
