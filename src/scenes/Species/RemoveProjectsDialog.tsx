import React, { useEffect, useState } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import { requestDeleteManyParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesDeleteManyRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface RemoveProjectsDialogProps {
  onClose: (reload?: boolean) => void;
  onSubmit?: () => void;
  ppSpeciesToRemove: number[];
}

export default function RemoveProjectsDialog(props: RemoveProjectsDialogProps): JSX.Element | null {
  const { onClose, ppSpeciesToRemove } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const deleteRequest = useAppSelector(selectParticipantProjectSpeciesDeleteManyRequest(requestId));

  const removePpSpecies = () => {
    if (!ppSpeciesToRemove?.length) {
      return;
    }

    const request = dispatch(requestDeleteManyParticipantProjectSpecies(ppSpeciesToRemove));
    setRequestId(request.requestId);
  };

  useEffect(() => {
    if (!deleteRequest) {
      return;
    }

    if (deleteRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      onClose(true);
    } else if (deleteRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      onClose();
    }
  }, [deleteRequest]);

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
        <Button key='button-2' label={strings.REMOVE} onClick={removePpSpecies} size='medium' type='destructive' />,
      ]}
      onClose={onClose}
      open={true}
      size='medium'
      skrim={true}
      title={strings.REMOVE_PROJECT}
    />
  );
}
