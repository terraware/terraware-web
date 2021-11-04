import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { deletePlant, putPlant } from 'src/api/plants2/plants';
import { createSpecies } from 'src/api/species/species';
import Button from 'src/components/common/button/Button';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';
import { Plant } from 'src/types/Plant';
import { Species, SpeciesById } from 'src/types/Species';
import DisplayPhoto from './DisplayPhoto';
import DeletePlantConfirmationModal from './DeletePlantConfirmationModal';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
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
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '4px',
      display: 'block',
      padding: theme.spacing(1),
    },
    deleteSpecies: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
      borderWidth: 1,
    },
    spacing: {
      marginRight: theme.spacing(2),
    },
  })
);

export type EditPlantModalProps = {
  onSave: (deleted: boolean) => void;
  onCancel: () => void;
  canDelete: boolean;
  speciesById: SpeciesById;
  plant: Plant;
  photoUrl?: string;
};

export default function EditPlantModal(props: EditPlantModalProps): JSX.Element {
  const classes = useStyles();
  const {onSave, onCancel, canDelete, speciesById, plant, photoUrl} = props;
  const [deleteConfirmationModelOpen, setDeleteConfirmationModelOpen] = useState<boolean>(false);
  // For creating a new species
  const [newSpeciesName, setNewSpeciesName] = useState<string>('');
  // For selecting an existing species
  const [selectedSpecies, setSelectedSpecies] = useState<Species>({
    id: plant.speciesId ?? -1,
    name: plant.speciesId
      ? speciesById.get(plant.speciesId)?.name ?? ''
      : ''
  });

  const handleTypingNewSpecies = (id: string, value: unknown) => {
    // @ts-ignore
    setNewSpeciesName(value.toString());
  };

  const handleSelectExistingSpecies = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(event.target.value, 10);
    // TODO what if the species name isn't there?
    setSelectedSpecies({id, name: speciesById.get(id)?.name ?? ''});
  };

  const inputtedValidNewSpecies = (): boolean => newSpeciesName !== null && newSpeciesName.length > 2;
  const selectedDifferentExistingSpecies = (): boolean => {
    return (plant.speciesId !== null && plant.speciesId !== selectedSpecies.id) ||
           (plant.speciesId === null && selectedSpecies.id !== -1);
  };

  // Check if the user has inputted anything
  const canSave = (): boolean => {
    return inputtedValidNewSpecies() || selectedDifferentExistingSpecies();
  };

  const handleSave = async () => {
    let speciesId: number | undefined;
    if (inputtedValidNewSpecies()) {
      // create new species
      const response = await(createSpecies(newSpeciesName));
      // TODO handle error if cannot save species
      if (response.species) {
        speciesId = response.species.id;
      }
    } else if (selectedDifferentExistingSpecies()) {
      if (selectedSpecies.id >= 0) {
        // update species id to an existing species
        speciesId = selectedSpecies.id;
      } else {
        // update species to "Other", aka remove species from the plant.
        speciesId = undefined;
      }
    } else {
      // TODO what happens if the user clicked the save button but there's nothing to save?
      // Developer error. Should close and console.error()
      onCancel();
    }

    await putPlant({...plant, speciesId});
    // TODO handle cannot save plant error
    onSave(false);
  };

  const handleDeletePlant = async () => {
    const response = await deletePlant(plant.featureId!);
    // TODO handle cannot delete plant error
    if (response.error === null) {
      onSave(true);
      setDeleteConfirmationModelOpen(false);
    }
  };

  return (
    <>
      {deleteConfirmationModelOpen &&
        <DeletePlantConfirmationModal
          onCancel={() => setDeleteConfirmationModelOpen(false)}
          confirmDelete={handleDeletePlant} />
      }
      <Dialog
        onClose={onCancel}
        disableEscapeKeyDown
        open={!deleteConfirmationModelOpen}
        maxWidth='md'
        classes={{ paper: classes.paper }}
      >
        <DialogTitle>
          <Typography variant='h6'>{strings.EDIT_SPECIES}</Typography>
          <DialogCloseButton onClick={onCancel} />
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <Typography variant='body1'>{strings.PHOTO}</Typography>
              </Grid>
              <Grid item xs={12}>
                <DisplayPhoto photoUrl={photoUrl}/>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <Typography variant='body1'>{strings.NOTES}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='body2'>{plant.notes}</Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1'>
                {strings.EXISTING_SPECIES_MSG}
              </Typography>
              <FormControl component='fieldset'
                           className={classes.container}
                           disabled={inputtedValidNewSpecies()}
              >
                <RadioGroup
                  aria-label='species'
                  name='species'
                  value={selectedSpecies.id}
                  onChange={handleSelectExistingSpecies}
                >
                  {Array.from(speciesById?.values()).map((sp) => (
                    <FormControlLabel
                      id={sp.name}
                      key={sp.id}
                      value={sp.id}
                      control={<Radio />}
                      label={sp.name}
                    />
                  ))}
                  <FormControlLabel
                    id='Other'
                    key={-1}
                    value={-1}
                    control={<Radio />}
                    label={strings.OTHER}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography component='p' variant='subtitle2'>
                {strings.OR}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} id='new-species-section'>
              <TextField
                id='new-species-name'
                value={newSpeciesName}
                onChange={handleTypingNewSpecies}
                label={strings.CREATE_NEW_SPECIES}
                aria-label='Species Name'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Box width={'100%'} className={classes.actions}>
            <Box>
              {plant && canDelete && (
                <Button
                  onClick={() => setDeleteConfirmationModelOpen(true)}
                  id='delete-species'
                  label={strings.DELETE}
                  type='destructive'
                  priority='secondary'
                />
              )}
            </Box>
            <Box>
              <Button
                onClick={onCancel}
                id='cancel'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                className={classes.spacing}
              />
              <Button onClick={handleSave} id='saveSpecies' label={strings.SAVE} disabled={!canSave()}/>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}