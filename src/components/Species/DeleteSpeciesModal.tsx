import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import strings from 'src/strings';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';
import { SpeciesService } from 'src/services';
import { SpeciesSearchResultRow } from './types';
import { useOrganization } from 'src/providers';

export interface DeleteSpeciesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (toDelete: number[]) => void;
  speciesToDelete: SpeciesSearchResultRow[];
}

export default function DeleteSpeciesDialog(props: DeleteSpeciesDialogProps): JSX.Element {
  const { onClose, open, onSubmit, speciesToDelete } = props;
  const { selectedOrganization } = useOrganization();
  const [inUseSpecies, setInUseSpecies] = useState<number[]>();
  const [toDelete, setToDelete] = useState<number[]>();
  const [cannotDelete, setCannotDelete] = useState<number[]>();

  useEffect(() => {
    const fetchInUseSpecies = async () => {
      const speciesIds = await SpeciesService.getInUseSpecies(selectedOrganization.id);
      setInUseSpecies(speciesIds);
    };

    fetchInUseSpecies();
  }, [selectedOrganization.id]);

  useEffect(() => {
    if (inUseSpecies) {
      const ids = new Set(inUseSpecies);
      const forDeletion = speciesToDelete
        .filter((species) => !ids.has(Number(species.id)))
        .map((species) => species.id);
      const avoidDeletion = speciesToDelete
        .filter((species) => ids.has(Number(species.id)))
        .map((species) => species.id);
      setToDelete(forDeletion);
      setCannotDelete(avoidDeletion);
    }
  }, [inUseSpecies, speciesToDelete]);

  const deleteSpecies = () => {
    onSubmit(toDelete ?? []);
  };

  const getMessage = (): string | JSX.Element => {
    if (cannotDelete?.length && !toDelete?.length) {
      return strings.SELECTED_SPECIES_IN_USE;
    }
    if (cannotDelete?.length && toDelete?.length) {
      return (
        <>
          <Typography>{strings.formatString(strings.SELECTED_SPECIES_SOME_IN_USE_1, cannotDelete?.length)}</Typography>
          <Typography>{strings.formatString(strings.SELECTED_SPECIES_SOME_IN_USE_2, toDelete?.length)}</Typography>
        </>
      );
    }
    return strings.SELECTED_SPECIES_UNUSED;
  };

  if (!toDelete) {
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
          disabled={!toDelete?.length}
        />,
      ]}
      skrim={true}
    >
      <>
        {getMessage()}
        <Typography>
          {toDelete.length ? strings.DELETE_CONFIRMATION_MODAL_MAIN_TEXT : strings.SELECTED_SPECIES_NOTHING_TO_DELETE}
        </Typography>
      </>
    </DialogBox>
  );
}
