import { Grid } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IconTooltip } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import { createSpecies, getSpeciesDetails, listSpeciesNames, updateSpecies } from 'src/api/species/species';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { GrowthForms, Species, SpeciesRequestError, StorageBehaviors } from 'src/types/Species';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import Checkbox from '../common/Checkbox';
import DialogBox from '../common/DialogBox/DialogBox';
import ErrorBox from '../common/ErrorBox/ErrorBox';
import Select from '../common/Select/Select';
import TextField from '../common/Textfield/Textfield';
import TooltipLearnMoreModal, {
  LearnMoreModalContentConservationStatus,
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  LearnMoreLink,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginRight: theme.spacing(2),
  },
  blockCheckbox: {
    display: 'block',
  },
  mainGrid: {
    textAlign: 'left',
  },
}));

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
  // Debounce search term so that it only gives us latest value if searchTerm has not been updated within last 500ms.
  const debouncedSearchTerm = useDebounce(record.scientificName, 250);
  const [showWarning, setShowWarning] = useState(false);

  const [tooltipLearnMoreModalOpen, setTooltipLearnMoreModalOpen] = useState(false);
  const [tooltipLearnMoreModalData, setTooltipLearnMoreModalData] = useState<TooltipLearnMoreModalData | undefined>(
    undefined
  );
  const openTooltipLearnMoreModal = (data: TooltipLearnMoreModalData) => {
    setTooltipLearnMoreModalData(data);
    setTooltipLearnMoreModalOpen(true);
  };
  const handleTooltipLearnMoreModalClose = () => {
    setTooltipLearnMoreModalOpen(false);
  };

  React.useEffect(() => {
    if (open) {
      setRecord(initSpecies(initialSpecies));
    }

    setNameFormatError('');
  }, [open, setRecord, initialSpecies]);

  useEffect(() => {
    const getOptionsForTyped = async () => {
      const requestId = Math.random().toString();
      setRequestId('names', requestId);
      const response = await listSpeciesNames(debouncedSearchTerm);
      if (response.requestSucceeded) {
        if (getRequestId('names') === requestId) {
          setOptionsForName(response.names);
        }
      }
    };

    const getDetails = async () => {
      if (!debouncedSearchTerm) {
        setNewScientificName(false);
      }
      if (debouncedSearchTerm.length > 1) {
        const requestId = Math.random().toString();
        setRequestId('details', requestId);
        const response = await getSpeciesDetails(debouncedSearchTerm);
        if (response.requestSucceeded) {
          if (getRequestId('details') === requestId) {
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
          }
        } else {
          setNewScientificName(true);
        }
      }
    };

    getOptionsForTyped();
    getDetails();
  }, [debouncedSearchTerm, setRecord]);

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
    setNewScientificName(false);
    onChange('scientificName', value);
  };

  return (
    <DialogBox
      scrolled
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
          icon={initialSpecies ? undefined : 'plus'}
          key='button-2'
        />,
      ]}
    >
      <TooltipLearnMoreModal
        content={tooltipLearnMoreModalData?.content}
        onClose={handleTooltipLearnMoreModalClose}
        open={tooltipLearnMoreModalOpen}
        title={tooltipLearnMoreModalData?.title}
      />
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
            editable={true}
            fullWidth={true}
            warningText={
              showWarning && !initialSpecies && newScientificName && !nameFormatError
                ? strings.formatString(strings.SCIENTIFIC_NAME_NOT_FOUND, record.scientificName)
                : ''
            }
            errorText={nameFormatError}
            hideArrow={true}
            onBlur={() => setShowWarning(true)}
            onFocus={() => setShowWarning(false)}
            tooltipTitle={strings.TOOLTIP_SCIENTIFIC_NAME}
          />
        </Grid>
        <Grid item xs={12}>
          <Select
            id='commonName'
            selectedValue={record.commonName}
            onChange={(value) => onChange('commonName', value)}
            options={optionsForCommonName}
            label={strings.COMMON_NAME}
            aria-label={strings.COMMON_NAME}
            readonly={false}
            fullWidth={true}
            hideArrow={true}
            tooltipTitle={strings.TOOLTIP_COMMON_NAME}
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
            tooltipTitle={strings.TOOLTIP_SPECIES_FAMILY}
          />
        </Grid>
        <Grid item xs={12}>
          <span>
            {strings.CONSERVATION_STATUS}
            <IconTooltip
              title={
                <>
                  {strings.TOOLTIP_SPECIES_CONSERVATION_STATUS}
                  <LearnMoreLink
                    onClick={() =>
                      openTooltipLearnMoreModal({
                        title: strings.CONSERVATION_STATUS,
                        content: <LearnMoreModalContentConservationStatus />,
                      })
                    }
                  />
                </>
              }
            />
          </span>
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
            fixedMenu
            tooltipTitle={
              <>
                {strings.TOOLTIP_SPECIES_GROWTH_FORM}
                <LearnMoreLink
                  onClick={() =>
                    openTooltipLearnMoreModal({
                      title: strings.GROWTH_FORM,
                      content: <LearnMoreModalContentGrowthForm />,
                    })
                  }
                />
              </>
            }
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
            fixedMenu
            tooltipTitle={
              <>
                {strings.TOOLTIP_SPECIES_SEED_STORAGE_BEHAVIOR}
                <LearnMoreLink
                  onClick={() =>
                    openTooltipLearnMoreModal({
                      title: strings.SEED_STORAGE_BEHAVIOR,
                      content: <LearnMoreModalContentSeedStorageBehavior />,
                    })
                  }
                />
              </>
            }
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
