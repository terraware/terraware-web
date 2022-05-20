import { Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { createSpecies, getSpeciesDetails, listSpeciesNames, updateSpecies } from 'src/api/species/species';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { GrowthForms, Species, SpeciesRequestError, StorageBehaviors } from 'src/types/Species';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import Checkbox from '../common/Checkbox';
import DialogBox from '../common/DialogBox/DialogBox';
import ErrorBox from '../common/ErrorBox/ErrorBox';
import Select from '../common/Select/Select';
import TextField from '../common/Textfield/Textfield';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spacing: {
      marginRight: theme.spacing(2),
    },
    blockCheckbox: {
      display: 'block',
    },
    mainGrid: {
      textAlign: 'left',
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

  const createNewSpecies = async () => {
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

  const saveChanges = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      const response = await updateSpecies(record, organization.id);
      if (response.requestSucceeded) {
        onClose(true);
      }
    }
  };

  const onChangeScientificName = (value: string) => {
    setNameFormatError('');
    onChange('scientificName', value);
  };

  return (
    <DialogBox
      onClose={handleCancel}
      open={open}
      title={initialSpecies ? strings.EDIT_SPECIES : strings.ADD_A_SPECIES}
      size={'large'}
      middleButtons={[
        <Button
          onClick={handleCancel}
          id='cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          className={classes.spacing}
          key='button-1'
        />,
        <Button
          onClick={initialSpecies ? saveChanges : createNewSpecies}
          id='add-species'
          label={initialSpecies ? strings.SAVE : strings.ADD_SPECIES}
          key='button-2'
        />,
      ]}
    >
      <Grid container spacing={4} className={classes.mainGrid}>
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
            label={strings.SCIENTIFIC_NAME_REQUIRED}
            aria-label={strings.SCIENTIFIC_NAME_REQUIRED}
            placeholder={strings.SELECT}
            readonly={false}
            fullWidth={true}
            warningText={
              !initialSpecies && newScientificName && !nameFormatError
                ? strings.formatString(strings.SCIENTIFIC_NAME_NOT_FOUND, record.scientificName)
                : ''
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
            label={strings.COMMON_OR_LOCAL_NAME}
            aria-label={strings.COMMON_OR_LOCAL_NAME}
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
            label={strings.FAMILY}
            aria-label={strings.FAMILY}
            type={'text'}
            placeholder={strings.TYPE}
          />
        </Grid>
        <Grid item xs={12}>
          <span>{strings.CONSERVATION_STATUS}</span>
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
            label={strings.GROWTH_FORM}
            aria-label={strings.GROWTH_FORM}
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
    </DialogBox>
  );
}
