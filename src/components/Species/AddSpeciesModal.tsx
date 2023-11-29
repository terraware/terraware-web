import { Grid } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { BusySpinner, Dropdown, MultiSelect } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import {
  conservationCategories,
  EcosystemType,
  ecosystemTypes,
  growthForms,
  Species,
  SpeciesRequestError,
  storageBehaviors,
} from 'src/types/Species';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import Checkbox from '../common/Checkbox';
import DialogBox from '../common/DialogBox/DialogBox';
import Select from '../common/Select/Select';
import TextField from '../common/Textfield/Textfield';
import TooltipLearnMoreModal, {
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  LearnMoreLink,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';

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
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization.id;
  const classes = useStyles();
  const { open, onClose, initialSpecies } = props;
  const [record, setRecord, onChange] = useForm<Species>(initSpecies());
  const [userSearched, setUserSearched] = useState<boolean>(false);
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [optionsForName, setOptionsForName] = useState<string[]>();
  const [optionsForCommonName, setOptionsForCommonName] = useState<string[]>();
  const [newScientificName, setNewScientificName] = useState(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
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
      const response = await SpeciesService.getSpeciesNames(debouncedSearchTerm);
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
        const response = await SpeciesService.getSpeciesDetails(debouncedSearchTerm);
        if (response.requestSucceeded) {
          if (getRequestId('details') === requestId) {
            setNewScientificName(false);
            const speciesDetails = response.speciesDetails;
            setRecord((previousRecord: Species) => {
              if (speciesDetails?.commonNames?.length === 1) {
                return {
                  ...previousRecord,
                  familyName: speciesDetails.familyName,
                  commonName: speciesDetails.commonNames[0].name,
                  conservationCategory: speciesDetails.conservationCategory ?? previousRecord.conservationCategory,
                };
              } else {
                setOptionsForCommonName(speciesDetails?.commonNames?.map((cN) => cN.name));
                return {
                  ...previousRecord,
                  conservationCategory: speciesDetails?.conservationCategory ?? previousRecord.conservationCategory,
                  familyName: speciesDetails?.familyName ?? previousRecord.familyName,
                };
              }
            });
          }
        } else {
          setNewScientificName(true);
        }
      }
    };

    if (userSearched) {
      getOptionsForTyped();
      getDetails();
    }
  }, [debouncedSearchTerm, setRecord, userSearched]);

  const handleCancel = () => {
    onClose(false);
  };

  const createNewSpecies = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.createSpecies(record, organizationId);
      setIsBusy(false);
      if (response.requestSucceeded) {
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
      setIsBusy(true);
      const response = await SpeciesService.updateSpecies(record, organizationId);
      setIsBusy(false);
      if (response.requestSucceeded) {
        onClose(true);
      }
    }
  };

  const onChangeScientificName = (value: string) => {
    setNameFormatError('');
    setNewScientificName(false);
    if (!userSearched) {
      setUserSearched(true);
    }
    onChange('scientificName', value);
  };

  return (
    <DialogBox
      scrolled
      onClose={handleCancel}
      open={open}
      title={initialSpecies ? strings.EDIT_SPECIES : strings.ADD_SPECIES}
      size={'large'}
      middleButtons={[
        <Button
          onClick={handleCancel}
          id='cancelAddSpecies'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          className={classes.spacing}
          key='button-1'
        />,
        <Button
          onClick={initialSpecies ? saveChanges : createNewSpecies}
          id='saveAddSpecies'
          label={strings.SAVE}
          key='button-2'
        />,
      ]}
    >
      {isBusy && <BusySpinner withSkrim={true} />}
      <TooltipLearnMoreModal
        content={tooltipLearnMoreModalData?.content}
        onClose={handleTooltipLearnMoreModalClose}
        open={tooltipLearnMoreModalOpen}
        title={tooltipLearnMoreModalData?.title}
      />
      <Grid container spacing={4} className={classes.mainGrid}>
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
            editable={true}
            fullWidth={true}
            hideArrow={true}
            tooltipTitle={strings.TOOLTIP_COMMON_NAME}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='familyName'
            value={record.familyName}
            onChange={(value) => onChange('familyName', value)}
            label={strings.FAMILY}
            aria-label={strings.FAMILY}
            type={'text'}
            tooltipTitle={strings.TOOLTIP_SPECIES_FAMILY}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='conservationCategory'
            label={strings.CONSERVATION_CATEGORY}
            aria-label={strings.CONSERVATION_CATEGORY}
            fullWidth={true}
            onChange={(value: string) => onChange('conservationCategory', value)}
            placeholder={strings.SELECT}
            options={conservationCategories()}
            selectedValue={record.conservationCategory}
            tooltipTitle={
              <>
                {`${strings.TOOLTIP_SPECIES_CONSERVATION_CATEGORY} `}
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://www.iucnredlist.org/resources/categories-and-criteria'
                >
                  {strings.LEARN_MORE}
                </a>
              </>
            }
          />
          <Checkbox
            id='Rare'
            name='rare'
            label={strings.RARE}
            onChange={() => onChange('rare', !record.rare)}
            value={record.rare}
            className={classes.blockCheckbox}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='growthForm'
            selectedValue={record.growthForm}
            onChange={(value) => onChange('growthForm', value)}
            options={growthForms(activeLocale)}
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
          <Dropdown
            id='seedStorageBehavior'
            selectedValue={record.seedStorageBehavior}
            onChange={(value) => onChange('seedStorageBehavior', value)}
            options={storageBehaviors()}
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
        <Grid item xs={12}>
          <MultiSelect
            fullWidth={true}
            label={strings.ECOSYSTEM_TYPE}
            tooltipTitle={
              <>
                {`${strings.TOOLTIP_ECOSYSTEM_TYPE} `}
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world'
                >
                  {strings.LEARN_MORE}
                </a>
              </>
            }
            onAdd={(type: EcosystemType) => {
              const selectedTypes = record.ecosystemTypes ?? [];
              selectedTypes.push(type);
              onChange('ecosystemTypes', selectedTypes);
            }}
            onRemove={(type: EcosystemType) => {
              onChange('ecosystemTypes', record.ecosystemTypes?.filter((et) => et !== type) ?? []);
            }}
            options={new Map(ecosystemTypes().map((type) => [type.value as EcosystemType, type.label]))}
            valueRenderer={(typeVal: string) => typeVal}
            selectedOptions={record.ecosystemTypes ?? []}
            placeHolder={strings.SELECT}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
