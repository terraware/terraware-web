import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Typography } from '@mui/material';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import strings from 'src/strings';
import { Species } from 'src/types/Species';

export interface DeleteSpeciesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (toDelete: number) => void;
  speciesToDelete: Species;
}

export default function DeleteSpeciesDialog(props: DeleteSpeciesDialogProps): JSX.Element | null {
  const { onClose, open, onSubmit, speciesToDelete } = props;
  const [cannotDelete, setCannotDelete] = useState<boolean>();

  const { inUseSpecies } = useSpeciesData();

  useEffect(() => {
    if (inUseSpecies) {
      if (inUseSpecies.find((_species) => _species.id === speciesToDelete.id)) {
        setCannotDelete(true);
      } else {
        setCannotDelete(false);
      }
    }
  }, [inUseSpecies, speciesToDelete]);

  const deleteSpecies = useCallback(() => {
    onSubmit(speciesToDelete.id);
  }, [onSubmit, speciesToDelete]);

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
