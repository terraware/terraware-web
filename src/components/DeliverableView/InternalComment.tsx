import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';
import useSnackbar from 'src/utils/useSnackbar';

import useUpdateDeliverable from './useUpdateDeliverable';

const useStyles = makeStyles(() => ({
  icon: {
    marginLeft: '-1px',
    marginTop: '-1px',
  },
}));

interface InternalCommentProps {
  deliverable: Deliverable;
}

const InternalComment = ({ deliverable }: InternalCommentProps) => {
  const snackbar = useSnackbar();
  const classes = useStyles();
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
      <Box display='flex' alignItems='center'>
        <strong>{strings.INTERNAL_COMMENTS}</strong>
        <Button
          className={classes.icon}
          icon='iconEdit'
          onClick={toggleDialog}
          priority='ghost'
          size='small'
          type='passive'
        />
      </Box>
      <TextField
        display
        id='internalComment'
        label={''}
        onChange={(value) => setInternalComment(value as string)}
        preserveNewlines
        type='textarea'
        value={deliverable.internalComment ?? strings.NO_COMMENTS_ADDED}
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
};

export default InternalComment;
