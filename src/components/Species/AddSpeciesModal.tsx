import { Box, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { createSpecies, getSpeciesDetails, listSpeciesNames } from 'src/api/species/species';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { GrowthForms, Species, SpeciesRequestError, StorageBehaviors } from 'src/types/Species';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import Checkbox from '../common/Checkbox';
import DialogCloseButton from '../common/DialogCloseButton';
import ErrorBox from '../common/ErrorBox/ErrorBox';
import Select from '../common/Select/Select';
import TextField from '../common/Textfield/Textfield';

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
    blockCheckbox: {
      display: 'block',
    },
  })
);

export type AddSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  organization: ServerOrganization;
  onError?: (snackbarMessage: string) => void;
  initialSpecies?: Species;
};

function initSpecies(species?: Species): Species {
  return (
    species ?? {
      scientificName: '',
      id: -1,
    }
  );
}

export default function AddSpeciesModal(props: AddSpeciesModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, organization, initialSpecies } = props;
  const [record, setRecord, onChange] = useForm<Species>(initSpecies());
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [optionsForName, setOptionsForName] = useState<string[]>();
  const [optionsForCommonName, setOptionsForCommonName] = useState<string[]>();
  const [newScientificName, setNewScientificName] = useState(false);

  React.useEffect(() => {
    if (open) {
      setRecord(initSpecies(initialSpecies));
    }

    setNameFormatError('');
  }, [open, setRecord, initialSpecies]);

  useEffect(() => {
    const getOptionsForTyped = async () => {
      if (record.scientificName.length > 1) {
        const response = await listSpeciesNames(record.scientificName);
        if (response.names) {
          setOptionsForName(response.names);
        }
      }
    };

    const getDetails = async () => {
      if (!record.scientificName) {
        setNewScientificName(false);
      }
      if (record.scientificName.length > 1) {
        const response = await getSpeciesDetails(record.scientificName);
        if (response.requestSucceeded) {
          setNewScientificName(false);
          setRecord((previousRecord: Species) => {
            if (response.commonNames.length === 1) {
              return {
                ...previousRecord,
                familyName: response.familyName,
                endangered: response.endangered,
                commonName: response.commonNames[0].name,
              };
            } else {
              setOptionsForCommonName(response.commonNames.map((cN) => cN.name));
              return {
                ...previousRecord,
                familyName: response.familyName,
                endangered: response.endangered,
              };
            }
          });
        } else {
          setNewScientificName(true);
        }
      }
    };

    getOptionsForTyped();
    getDetails();
  }, [record.scientificName, setRecord]);

  const handleCancel = () => {
    onClose(false);
  };

  const saveSpecies = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      const response = await createSpecies(record, organization.id);
      if (response.id !== -1) {
        onClose(true);
      } else {
        if (response.error === SpeciesRequestError.PreexistingSpecies) {
          setNameFormatError(strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName));
        }
      }
    }
  };

  const onChangeScientificName = (value: string) => {
    setNameFormatError('');
    onChange('scientificName', value);
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='md' classes={{ paper: classes.paper }}>
      <DialogTitle>
        <Typography variant='h6'>{strings.ADD_A_SPECIES}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          {nameFormatError && (
            <ErrorBox
              text={
                nameFormatError === strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName)
                  ? strings.DUPLICATE_SPECIES_FOUND
                  : strings.FILL_OUT_ALL_FIELDS
              }
            />
          )}
          <Grid item xs={12}>
            <Select
              id='scientificName'
              selectedValue={record.scientificName}
              onChange={(value) => onChangeScientificName(value)}
              options={optionsForName}
              label={strings.SCIENTIFIC_NAME}
              aria-label={strings.SCIENTIFIC_NAME}
              placeholder={strings.SELECT}
              readonly={false}
              fullWidth={true}
              warningText={
                newScientificName ? strings.formatString(strings.SCIENTIFIC_NAME_NOT_FOUND, record.scientificName) : ''
              }
              errorText={nameFormatError}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              id='commonName'
              selectedValue={record.commonName}
              onChange={(value) => onChange('commonName', value)}
              options={optionsForCommonName}
              label={strings.COMMON_OR_LOCAL_NAME_OPT}
              aria-label={strings.COMMON_OR_LOCAL_NAME_OPT}
              placeholder={strings.TYPE}
              readonly={false}
              fullWidth={true}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id='familyName'
              value={record.familyName}
              onChange={onChange}
              label={strings.FAMILY_OPTIONAL}
              aria-label={strings.FAMILY_OPTIONAL}
              type={'text'}
              placeholder={strings.TYPE}
            />
          </Grid>
          <Grid item xs={12}>
            <span>{strings.CONSERVATION_STATUS_OPT}</span>
            <Checkbox
              id='Endangered'
              name='conservationStatus'
              label={strings.ENDANGERED}
              onChange={() => onChange('endangered', !record.endangered)}
              value={record.endangered}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Rare'
              name='conservationStatus'
              label={strings.RARE}
              onChange={() => onChange('rare', !record.rare)}
              value={record.rare}
              className={classes.blockCheckbox}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              id='growthForm'
              selectedValue={record.growthForm}
              onChange={(value) => onChange('growthForm', value)}
              options={GrowthForms}
              label={strings.GROWTH_FORM_OPT}
              aria-label={strings.GROWTH_FORM_OPT}
              placeholder={strings.SELECT}
              fullWidth={true}
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              id='seedStorageBehavior'
              selectedValue={record.seedStorageBehavior}
              onChange={(value) => onChange('seedStorageBehavior', value)}
              options={StorageBehaviors}
              label={strings.SEED_STORAGE_BEHAVIOR}
              aria-label={strings.SEED_STORAGE_BEHAVIOR}
              placeholder={strings.SELECT}
              fullWidth={true}
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
            <Button onClick={saveSpecies} id='add-species' label={strings.ADD_SPECIES} />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
