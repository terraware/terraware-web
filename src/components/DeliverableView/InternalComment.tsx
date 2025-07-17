import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useUser } from 'src/providers';
import strings from 'src/strings';

interface InternalCommentProps<T> {
  entity: T;
  update: (internalComment: string) => void;
}

function InternalComment<T extends { internalComment?: string }>({ entity, update }: InternalCommentProps<T>) {
  const { isAllowed } = useUser();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [internalComment, setInternalComment] = useState(entity.internalComment || '');

  const isAllowedUpdateDeliverable = isAllowed('UPDATE_DELIVERABLE');

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleUpdate = () => {
    update(internalComment);
    toggleDialog();
  };

  useEffect(() => {
    if (entity.internalComment) {
      setInternalComment(entity.internalComment);
    }
  }, [entity.internalComment]);

  return (
    <>
      <Box display='flex' alignItems='center'>
        <strong>{strings.INTERNAL_COMMENTS}</strong>
        {isAllowedUpdateDeliverable && (
          <Button
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
        )}
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
        title={strings.INTERNAL_COMMENTS}
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
              label={''}
              type='textarea'
              id='internalComment'
              onChange={(value) => setInternalComment(value as string)}
              value={internalComment}
              preserveNewlines
            />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}

export default InternalComment;
