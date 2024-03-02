import React, { useCallback, useEffect, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useUpdateDeliverable from 'src/scenes/AcceleratorRouter/useUpdateDeliverable';
import strings from 'src/strings';
import theme from 'src/theme';
import { Deliverable } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

interface InternalCommentProps {
  deliverable: Deliverable;
}

const InternalComment = ({ deliverable }: InternalCommentProps) => {
  const snackbar = useSnackbar();
  const { status, update } = useUpdateDeliverable();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [internalComment, setInternalComment] = useState(deliverable.internalComment || '');

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleUpdate = () => {
    update({ ...deliverable, internalComment });
  };

  useEffect(() => {
    if (status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      toggleDialog();
    } else if (status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [status, snackbar, toggleDialog]);

  return (
    <>
      <strong>{strings.INTERNAL_COMMENTS}</strong>{' '}
      <Typography sx={{ marginLeft: theme.spacing(1) }} component={'span'}>
        {deliverable.internalComment ?? strings.NO_COMMENTS_ADDED}
      </Typography>
      <Button onClick={toggleDialog} icon='iconEdit' type='passive' priority='ghost' size='small' />
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
};

export default InternalComment;
