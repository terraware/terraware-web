import { Box, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { createSpecies, updateSpecies } from 'src/api/species/species';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Species, SpeciesRequestError } from 'src/types/Species';
import useForm from 'src/utils/useForm';
import Button from '../../common/button/Button';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: '500px',
    },
    spacing: {
      marginRight: theme.spacing(2),
    },
  })
);

export type SimpleSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  initialSpecies?: Species;
  organization: ServerOrganization;
  onError: (snackbarMessage: string) => void;
};

function initSpecies(species?: Species): Species {
  return (
    species ?? {
      name: '',
      id: 0,
    }
  );
}
export default function SimpleSpeciesModal(props: SimpleSpeciesModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, initialSpecies, organization, onError } = props;
  const [record, setRecord, onChange] = useForm<Species>(initSpecies(initialSpecies));
  const [nameFormatError, setNameFormatError] = useState('');

  useEffect(() => {
    if (open) {
      setRecord(initSpecies(initialSpecies));
    }
  }, [open, initialSpecies, setRecord]);

  const handleCancel = () => {
    setNameFormatError('');
    setRecord(initSpecies(initialSpecies));
    onClose(false);
  };

  const handleOk = async () => {
    let snackbarMessage = '';
    if (record.name.trim()) {
      setNameFormatError('');
      if (record.id === 0) {
        const newSpecies = await createSpecies(record.name, organization.id);
        if (newSpecies.species?.id) {
          snackbarMessage = strings.SNACKBAR_MSG_NEW_SPECIES_ADDED;
          onClose(true, snackbarMessage);
        } else if (newSpecies.error) {
          if (newSpecies.error === SpeciesRequestError.PreexistingSpecies) {
            snackbarMessage = strings.PREEXISTING_SPECIES;
          } else {
            snackbarMessage = strings.GENERIC_ERROR;
          }
          onError(snackbarMessage);
        }
      } else {
        try {
          await updateSpecies(record, organization.id);
          snackbarMessage = strings.SNACKBAR_MSG_CHANGES_SAVED;
          onClose(true, snackbarMessage);
        } catch {
          snackbarMessage = strings.GENERIC_ERROR;
          onError(snackbarMessage);
        }
      }
    } else {
      setNameFormatError(strings.REQUIRED_FIELD);
    }
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='md' classes={{ paper: classes.paper }}>
      <DialogTitle>
        <Typography variant='h6'>{initialSpecies ? strings.EDIT_SPECIES : strings.ADD_SPECIES}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='name'
              value={record.name}
              onChange={onChange}
              label={strings.SPECIES_NAME}
              aria-label={strings.SPECIES_NAME}
              error={!!nameFormatError}
              helperText={!!nameFormatError && !record.name ? nameFormatError : ''}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box />
          <Box>
            <Button
              onClick={handleCancel}
              id='cancel'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button onClick={handleOk} id='save-species' label={initialSpecies ? strings.SAVE : strings.ADD} />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
