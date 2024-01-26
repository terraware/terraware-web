import React, { useEffect, useState } from 'react';
import { Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { BusySpinner, Button, DialogBox, TextTruncated } from '@terraware/web-components';
import { SpeciesService } from 'src/services';
import { SpeciesSearchResultRow } from './types';
import { useOrganization } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteSpeciesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (toDelete: number[]) => void;
  speciesToDelete: SpeciesSearchResultRow[];
}

export default function DeleteSpeciesDialog(props: DeleteSpeciesDialogProps): JSX.Element | null {
  const { onClose, open, onSubmit, speciesToDelete } = props;
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const [inUseSpecies, setInUseSpecies] = useState<Record<string, string>>();
  const [toDelete, setToDelete] = useState<number[]>();
  const [cannotDelete, setCannotDelete] = useState<number[]>();

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
      const forDeletion = speciesToDelete
        .filter((species) => !inUseSpecies[species.id.toString()])
        .map((species) => species.id);
      const avoidDeletion = speciesToDelete
        .filter((species) => inUseSpecies[species.id.toString()])
        .map((species) => species.id);
      setToDelete(forDeletion);
      setCannotDelete(avoidDeletion);
    }
  }, [inUseSpecies, speciesToDelete]);

  const deleteSpecies = () => {
    onSubmit(toDelete ?? []);
  };

  const getTruncated = (speciesIds: number[]): JSX.Element | null => {
    if (!inUseSpecies) {
      return null;
    }
    const inputValues = speciesIds.map((id) => inUseSpecies[id.toString()]);

    return (
      <TextTruncated
        stringList={inputValues}
        maxLengthPx={350}
        textStyle={{ fontSize: 16 }}
        showAllStyle={{ padding: theme.spacing(2), fontSize: 16 }}
        listSeparator={strings.LIST_SEPARATOR}
        moreSeparator={strings.TRUNCATED_TEXT_MORE_SEPARATOR}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    );
  };

  const getMessage = (): string | JSX.Element => {
    if (cannotDelete?.length && !toDelete?.length) {
      return strings.SELECTED_SPECIES_IN_USE;
    }
    if (cannotDelete?.length && toDelete?.length) {
      return (
        <>
          <Typography marginBottom={1}>{strings.SELECTED_SPECIES_SOME_IN_USE}</Typography>
          {getTruncated(cannotDelete)}
        </>
      );
    }
    return strings.SELECTED_SPECIES_UNUSED;
  };

  if (!open) {
    return null;
  }

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
        {toDelete.length > 0 && <Typography marginTop={2}>{strings.DELETE_CONFIRMATION_MODAL_MAIN_TEXT}</Typography>}
      </>
    </DialogBox>
  );
}
