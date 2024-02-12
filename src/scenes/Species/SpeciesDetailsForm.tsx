import { Grid, Theme, useTheme } from '@mui/material';
import TextField from '../../components/common/Textfield/Textfield';
import { makeStyles } from '@mui/styles';
import { Dropdown, MultiSelect } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import {
  conservationCategories,
  EcosystemType,
  ecosystemTypes,
  growthForms,
  Species,
  storageBehaviors,
} from 'src/types/Species';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import Checkbox from '../../components/common/Checkbox';
import Select from '../../components/common/Select/Select';
import TooltipLearnMoreModal, {
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  LearnMoreLink,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';

const useStyles = makeStyles((theme: Theme) => ({
  blockCheckbox: {
    display: 'block',
  },
}));

function initSpecies(species?: Species): Species {
  return (
    species ?? {
      scientificName: '',
      id: -1,
    }
  );
}
type SpeciesDetailsFormProps = {
  speciesId?: string | undefined;
  gridSize: number;
  record: Species;
  setRecord: React.Dispatch<React.SetStateAction<Species>>;
  onChange: (id: string, value: unknown) => void;
  nameFormatError: string | string[];
  setNameFormatError: React.Dispatch<React.SetStateAction<string | string[]>>;
};

export default function SpeciesDetailsForm({
  gridSize,
  speciesId,
  record,
  setRecord,
  onChange,
  nameFormatError,
  setNameFormatError,
}: SpeciesDetailsFormProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const classes = useStyles();
  const [species, setSpecies] = useState<Species>();
  const history = useHistory();
  const { selectedOrganization } = useOrganization();
  const [optionsForName, setOptionsForName] = useState<string[]>();
  const [optionsForCommonName, setOptionsForCommonName] = useState<string[]>();
  const [newScientificName, setNewScientificName] = useState(false);
  const [userSearched, setUserSearched] = useState<boolean>(false);
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

  useEffect(() => {
    const getSpecies = async () => {
      const speciesResponse = await SpeciesService.getSpecies(Number(speciesId), selectedOrganization.id);
      if (speciesResponse.requestSucceeded) {
        setSpecies(speciesResponse.species);
      } else {
        history.push(APP_PATHS.SPECIES);
      }
    };
    if (selectedOrganization && speciesId) {
      getSpecies();
    }
  }, [speciesId, selectedOrganization, history]);

  useEffect(() => {
    setRecord({
      scientificName: species?.scientificName || '',
      commonName: species?.commonName,
      id: species?.id ?? -1,
      familyName: species?.familyName,
      conservationCategory: species?.conservationCategory,
      growthForm: species?.growthForm,
      seedStorageBehavior: species?.seedStorageBehavior,
      ecosystemTypes: species?.ecosystemTypes,
    });
  }, [species, setRecord, selectedOrganization]);

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

  const onChangeScientificName = (value: string) => {
    setNameFormatError('');
    setNewScientificName(false);
    if (!userSearched) {
      setUserSearched(true);
    }
    onChange('scientificName', value);
  };

  return (
    <>
      <TooltipLearnMoreModal
        content={tooltipLearnMoreModalData?.content}
        onClose={handleTooltipLearnMoreModalClose}
        open={tooltipLearnMoreModalOpen}
        title={tooltipLearnMoreModalData?.title}
      />
      <Grid container spacing={3}>
        <Grid item xs={gridSize}>
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
              showWarning && newScientificName && !nameFormatError
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
        <Grid item xs={gridSize}>
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
        <Grid item xs={gridSize}>
          <TextField
            id={'family'}
            label={strings.FAMILY}
            onChange={(value) => onChange('familyname', value)}
            value={record.familyName}
            type='text'
          />
        </Grid>
        <Grid item xs={gridSize}>
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
        </Grid>
        <Grid item xs={gridSize}>
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
        <Grid item xs={gridSize}>
          <Checkbox
            id='Rare'
            name='rare'
            label={strings.RARE}
            onChange={() => onChange('rare', !record.rare)}
            value={record.rare}
            className={classes.blockCheckbox}
          />
        </Grid>
        <Grid item xs={gridSize}>
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
        <Grid item xs={gridSize}>
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
    </>
  );
}
