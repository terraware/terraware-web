import React, { useCallback, useState } from 'react';

import { Grid } from '@mui/material';
import { BusySpinner, Textfield } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';

export interface AddNewContactTypeProps {
  onClose: () => void;
  reload?: () => void;
}

export default function AddNewContactType({ onClose, reload }: AddNewContactTypeProps): JSX.Element {
  const { strings } = useLocalization();

  const [saving, setSaving] = useState(false);
  const [newContactType, setNewContactType] = useState('');

  const onChange = useCallback(
    (value: unknown) => {
      setNewContactType(value as string);
    },
    [setNewContactType]
  );

  const onSave = useCallback(() => {
    console.log('Saving new contact type:', newContactType);
    setSaving(true);
    // TODO: save new contact type
    setSaving(false);
    reload?.();
    onClose();
  }, [newContactType, onClose, reload]);

  return (
    <DialogBox
      onClose={onClose}
      open
      size='medium'
      title='New Contact Type'
      middleButtons={[
        <Button
          id='cancelChangeQuantity'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          id='saveChangeQuantity'
          key='button-2'
          label={strings.SAVE}
          onClick={onSave}
          size='medium'
          type='productive'
        />,
      ]}
    >
      <Grid>
        {saving && <BusySpinner withSkrim />}
        <Grid display='flex' item textAlign='left' xs={11}>
          <Textfield
            id='newContactType'
            label='New Contact Type'
            onChange={onChange}
            type='text'
            value={newContactType}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
