import React, { useCallback } from 'react';

import { Portal, Typography } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { useDeleteSavedTableViewMutation } from 'src/queries/generated/savedTableViews';
import useSnackbar from 'src/utils/useSnackbar';

export type DeleteViewModalProps = {
  onClose: () => void;
  onDeleted?: (id: number) => void;
  view: { id: number; name: string };
};

const DeleteViewModal = ({ onClose, onDeleted, view }: DeleteViewModalProps) => {
  const { strings } = useLocalization();
  const snackbar = useSnackbar();
  const [deleteSavedTableView, { isLoading }] = useDeleteSavedTableViewMutation();

  const deleteView = useCallback(async () => {
    try {
      await deleteSavedTableView(view.id).unwrap();
      onDeleted?.(view.id);
      snackbar.toastSuccess(strings.formatString(strings.SAVED_VIEW_DELETED, view.name));
      onClose();
    } catch {
      snackbar.toastError();
    }
  }, [deleteSavedTableView, onClose, onDeleted, snackbar, strings, view.id, view.name]);

  const handleDelete = useCallback(() => void deleteView(), [deleteView]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  return (
    <Portal>
      <DialogBox
        onClose={handleClose}
        open
        title={strings.DELETE_VIEW_TITLE}
        size='medium'
        middleButtons={[
          <Button
            disabled={isLoading}
            id='cancelDeleteView'
            key='cancel'
            label={strings.CANCEL}
            onClick={handleClose}
            priority='secondary'
            type='passive'
          />,
          <Button
            disabled={isLoading}
            id='confirmDeleteView'
            key='delete'
            label={strings.DELETE_VIEW}
            onClick={handleDelete}
            type='destructive'
          />,
        ]}
      >
        <Typography textAlign='left'>{strings.formatString(strings.DELETE_VIEW_CONFIRMATION, view.name)}</Typography>
      </DialogBox>
      {isLoading && <BusySpinner withSkrim />}
    </Portal>
  );
};

export default DeleteViewModal;
