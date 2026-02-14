import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import { requestDeleteManyAcceleratorProjectSpecies } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import { selectAcceleratorProjectSpeciesDeleteManyRequest } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface RemoveSpeciesDialogProps {
  onClose: (reload?: boolean) => void;
  onSubmit?: () => void;
  open: boolean;
  speciesToRemove: number[];
}

export default function RemoveSpeciesDialog(props: RemoveSpeciesDialogProps): JSX.Element | null {
  const { onClose, open, speciesToRemove } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const deleteRequest = useAppSelector(selectAcceleratorProjectSpeciesDeleteManyRequest(requestId));

  const removeSelectedSpeciesFromAcceleratorProject = useCallback(() => {
    if (!speciesToRemove?.length) {
      return;
    }

    const request = dispatch(requestDeleteManyAcceleratorProjectSpecies(speciesToRemove));
    setRequestId(request.requestId);
  }, [dispatch, speciesToRemove]);

  useEffect(() => {
    if (!deleteRequest) {
      return;
    }

    if (deleteRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      onClose(true);
    } else {
      snackbar.toastError(strings.GENERIC_ERROR);
      onClose();
    }
  }, [deleteRequest, onClose, snackbar]);

  if (!open) {
    return null;
  }

  return (
    <DialogBox
      message={strings.ARE_YOU_SURE}
      middleButtons={[
        <Button
          key='button-1'
          label={strings.CANCEL}
          onClick={() => onClose()}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          key='button-2'
          label={strings.REMOVE}
          onClick={removeSelectedSpeciesFromAcceleratorProject}
          size='medium'
          type='destructive'
        />,
      ]}
      onClose={onClose}
      open={open}
      size='medium'
      skrim={true}
      title={strings.REMOVE_SPECIES}
    />
  );
}
