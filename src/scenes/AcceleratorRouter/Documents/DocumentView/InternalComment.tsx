import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { DocumentStatuses } from 'src/types/Document';

interface InternalCommentProps<T> {
  entity: T;
  update: (internalComment: string, status: string) => void;
  disabled?: boolean;
}

function InternalComment<T extends { internalComment?: string; status: string }>({
  entity,
  update,
  disabled,
}: InternalCommentProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [internalComment, setInternalComment] = useState(entity.internalComment || '');
  const [status, setStatus] = useState(entity.status || '');

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleUpdate = () => {
    update(internalComment, status);
    toggleDialog();
  };

  useEffect(() => {
    if (entity.internalComment) {
      setInternalComment(entity.internalComment);
    }
  }, [entity.internalComment]);

  useEffect(() => {
    setStatus(entity.status);
  }, [entity.status]);

  const dropdownOptions: DropdownItem[] = DocumentStatuses.map((status) => ({
    label: status,
    value: status,
  }));

  return (
    <>
      <Box display='flex' alignItems='center'>
        <strong>{strings.INTERNAL_COMMENTS}</strong>
        <Button
          disabled={disabled}
          icon='iconEdit'
          onClick={toggleDialog}
          priority='ghost'
          size='small'
          type='passive'
          style={{
            marginLeft: '-1px',
            marginTop: '-1px',
          }}
        />
      </Box>
      <TextField
        display
        id='internalComment'
        label={''}
        onChange={(value) => setInternalComment(value as string)}
        preserveNewlines
        type='textarea'
        value={entity.internalComment ?? strings.NO_COMMENTS_ADDED}
      />
      <DialogBox
        onClose={toggleDialog}
        open={isDialogOpen}
        title={strings.DOCUMENT_STATUS}
        size='large'
        middleButtons={[
          <Button
            id='cancelEditInternalComment'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={toggleDialog}
            key='button-1'
          />,
          <Button id='updateInternalComment' label={strings.SAVE} onClick={handleUpdate} key='button-2' />,
        ]}
      >
        <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
          <Grid item xs={12}>
            <TextField
              label={strings.INTERNAL_COMMENTS}
              type='textarea'
              id='internalComment'
              onChange={(value) => setInternalComment(value as string)}
              value={internalComment}
              preserveNewlines
            />
          </Grid>
          <Grid item xs={12}>
            <Dropdown
              fullWidth={true}
              label={strings.STATUS}
              onChange={(value) => setStatus(value)}
              options={dropdownOptions}
              required
              selectedValue={status}
            />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}

export default InternalComment;
