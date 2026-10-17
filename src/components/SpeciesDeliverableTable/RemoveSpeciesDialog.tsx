import React, { type JSX, useCallback } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import { useDeleteParticipantProjectSpeciesMutation } from 'src/queries/generated/acceleratorProjectSpecies';
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
  const [deleteParticipantProjectSpecies] = useDeleteParticipantProjectSpeciesMutation();

  const removeSelectedSpeciesFromAcceleratorProject = useCallback(() => {
    if (!speciesToRemove?.length) {
      return;
    }

    void deleteParticipantProjectSpecies({ participantProjectSpeciesIds: speciesToRemove })
      .unwrap()
      .then(() => snackbar.toastSuccess(strings.CHANGES_SAVED))
      .catch(() => snackbar.toastError(strings.GENERIC_ERROR))
      .finally(() => onClose());
  }, [deleteParticipantProjectSpecies, onClose, snackbar, speciesToRemove]);

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
