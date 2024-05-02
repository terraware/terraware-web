import React from 'react';

import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import ParticipantProjectSpeciesService from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface RemoveSpeciesDialogProps {
  onClose: () => void;
  onSubmit?: () => void;
  open: boolean;
  speciesToRemove: number[];
}

export default function RemoveSpeciesDialog(props: RemoveSpeciesDialogProps): JSX.Element | null {
  const { onClose, open, speciesToRemove } = props;
  const snackbar = useSnackbar();

  const removeSelectedSpeciesFromParticipantProject = async () => {
    if (!speciesToRemove?.length) {
      return;
    }

    const removeSpeciesPromises = speciesToRemove.map((participantProjectSpeciesId) =>
      ParticipantProjectSpeciesService.remove(participantProjectSpeciesId)
    );
    try {
      const results = await Promise.allSettled(removeSpeciesPromises);
      const allRequestsCompletedSuccessfully = results.every(
        (result) => result.status === 'fulfilled' && result.value?.status === 'ok'
      );
      if (allRequestsCompletedSuccessfully) {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error('Error removing species from participant project', error);
    }

    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.REMOVE_SPECIES}
      size='medium'
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button
          label={strings.REMOVE}
          type='destructive'
          onClick={removeSelectedSpeciesFromParticipantProject}
          size='medium'
          key='button-2'
        />,
      ]}
      skrim={true}
    >
      <Typography sx={{ paddingTop: 3 }}>{strings.ARE_YOU_SURE}</Typography>
    </DialogBox>
  );
}
