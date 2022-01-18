import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { deletePlant, putPlant } from 'src/api/plants/plants';
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

export type AddNewOrganizationModalProps = {
  onSave: (deleted: boolean) => void;
  onCancel: () => void;
};

export default function AddNewOrganizationModal(props: AddNewOrganizationModalProps): JSX.Element {
  const classes = useStyles();
  const { onSave, onCancel } = props;

  return (
    <Dialog onClose={onCancel} disableEscapeKeyDown maxWidth='md' classes={{ paper: classes.paper }}>
      <DialogTitle>
        <Typography variant='h6'>{strings.ADD_NEW_ORGANIZATION}</Typography>
        <DialogCloseButton onClick={onCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Grid item xs={12}>
              <Typography variant='body1'>{strings.PHOTO}</Typography>
            </Grid>
            <Grid item xs={12}>
              <DisplayPhoto photoUrl={photoUrl} />
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
            <Typography variant='body1'>{strings.EXISTING_SPECIES_MSG}</Typography>
            <FormControl component='fieldset' className={classes.container} disabled={inputtedValidNewSpecies()}>
              <RadioGroup
                aria-label='species'
                name='species'
                value={selectedSpecies.id}
                onChange={handleSelectExistingSpecies}
              >
                {Array.from(speciesById?.values()).map((sp) => (
                  <FormControlLabel id={sp.name} key={sp.id} value={sp.id} control={<Radio />} label={sp.name} />
                ))}
                <FormControlLabel id='Other' key={-1} value={-1} control={<Radio />} label={strings.OTHER} />
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
            <Button onClick={handleSave} id='saveSpecies' label={strings.SAVE} disabled={!canSave()} />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
