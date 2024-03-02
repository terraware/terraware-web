import React, { useEffect, useState } from 'react';

import { Typography } from '@mui/material';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import { useOrganization } from 'src/providers';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteSpeciesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (toDelete: number) => void;
  speciesToDelete: Species;
}

export default function DeleteSpeciesDialog(props: DeleteSpeciesDialogProps): JSX.Element | null {
  const { onClose, open, onSubmit, speciesToDelete } = props;
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const [inUseSpecies, setInUseSpecies] = useState<Record<string, string>>();
  const [cannotDelete, setCannotDelete] = useState<boolean>();

  useEffect(() => {
    const fetchInUseSpecies = async () => {
      const response = await SpeciesService.getAllSpecies(selectedOrganization.id, true);
      if (response.requestSucceeded && response.species) {
        setInUseSpecies(
          response.species.reduce(
            (acc, species) => ({ ...acc, [species.id.toString()]: species.scientificName }),
            {} as Record<string, string>
          )
        );
      } else {
        snackbar.toastError(strings.GENERIC_ERROR);
        onClose();
      }
    };

    if (open) {
      fetchInUseSpecies();
    }
  }, [selectedOrganization.id, open, onClose, snackbar]);

  useEffect(() => {
    if (inUseSpecies) {
      if (inUseSpecies[speciesToDelete.id.toString()]) {
        setCannotDelete(true);
      } else {
        setCannotDelete(false);
      }
    }
  }, [inUseSpecies, speciesToDelete]);

  const deleteSpecies = () => {
    onSubmit(speciesToDelete.id);
  };

  const getMessage = (): string | JSX.Element => {
    if (cannotDelete) {
      return strings.SELECTED_SPECIES_IN_USE;
    }
    return strings.SELECTED_SPECIES_UNUSED;
  };

  if (!open) {
    return null;
  }

  if (cannotDelete === undefined) {
    return <BusySpinner withSkrim={true} />;
  }

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_SPECIES}
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
          label={strings.DELETE}
          type='destructive'
          onClick={deleteSpecies}
          size='medium'
          key='button-2'
          disabled={cannotDelete}
        />,
      ]}
      skrim={true}
    >
      <>
        {getMessage()}
        {!cannotDelete && <Typography marginTop={2}>{strings.DELETE_CONFIRMATION_MODAL_MAIN_TEXT}</Typography>}
      </>
    </DialogBox>
  );
}
