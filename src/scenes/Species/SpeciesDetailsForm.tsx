import React, { useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dropdown, MultiSelect } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import TooltipLearnMoreModal, {
  LearnMoreLink,
  LearnMoreModalContentGrowthForm,
  LearnMoreModalContentSeedStorageBehavior,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import Checkbox from 'src/components/common/Checkbox';
import Select from 'src/components/common/Select/Select';
import TextField from 'src/components/common/Textfield/Textfield';
import { useLocalization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import {
  EcosystemType,
  GrowthForm,
  PlantMaterialSourcingMethod,
  Species,
  SuccessionalGroup,
  conservationCategories,
  ecosystemTypes,
  growthForms,
  plantMaterialSourcingMethods,
  storageBehaviors,
  successionalGroups,
} from 'src/types/Species';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';

const useStyles = makeStyles(() => ({
  blockCheckbox: {
    display: 'block',
  },
}));

type SpeciesDetailsFormProps = {
  gridSize: number;
  record: Species;
  setRecord?: React.Dispatch<React.SetStateAction<Species>>;
  onChange: (id: string, value: unknown) => void;
  nameFormatError: string | string[];
  setNameFormatError: React.Dispatch<React.SetStateAction<string | string[]>>;
};

export default function SpeciesDetailsForm({
  gridSize,
  record,
  setRecord,
  onChange,
  nameFormatError,
  setNameFormatError,
}: SpeciesDetailsFormProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const classes = useStyles();
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
  const { isMobile } = useDeviceInfo();

  const openTooltipLearnMoreModal = (data: TooltipLearnMoreModalData) => {
    setTooltipLearnMoreModalData(data);
    setTooltipLearnMoreModalOpen(true);
  };
  const handleTooltipLearnMoreModalClose = () => {
    setTooltipLearnMoreModalOpen(false);
  };

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
      if (debouncedSearchTerm.length > 1 && setRecord) {
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
            onChange={(value) => onChange('familyName', value)}
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
          <MultiSelect
            id='growthForms'
            label={strings.GROWTH_FORM}
            fullWidth={true}
            onAdd={(growthForm: GrowthForm) => {
              const selectedGrowthForms = [...(record.growthForms ?? [])];
              selectedGrowthForms.push(growthForm);
              onChange('growthForms', selectedGrowthForms);
            }}
            onRemove={(growthForm: GrowthForm) => {
              onChange('growthForms', record.growthForms?.filter((gf) => gf !== growthForm) ?? []);
            }}
            options={new Map(growthForms(activeLocale).map((gf) => [gf.value as GrowthForm, gf.label]))}
            valueRenderer={(gfVal: string) => gfVal}
            selectedOptions={record.growthForms ?? []}
            placeHolder={strings.SELECT}
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
        <Grid item xs={gridSize} sx={{ 'align-self': 'center' }}>
          <Checkbox
            id='Rare'
            name='rare'
            label={strings.RARE}
            onChange={() => onChange('rare', !record.rare)}
            value={record.rare}
            className={classes.blockCheckbox}
          />
        </Grid>
        {/* TODO this will eventually come from the participant project species, not the org species */}
        {/* <Grid item xs={gridSize}>
              <Dropdown
                id='nativeStatus'
                selectedValue={record.nativeStatus}
                onChange={(value) => onChange('nativeStatus', value)}
                options={nativeStatuses()}
                label={strings.NATIVE_NON_NATIVE}
                aria-label={strings.NATIVE_NON_NATIVE}
                placeholder={strings.SELECT}
                fullWidth={true}
                fixedMenu
                required
              />
            </Grid> */}
        <Grid item xs={gridSize}>
          <TextField
            id={'nativeEcosystem'}
            label={strings.NATIVE_ECOSYSTEM}
            onChange={(value) => onChange('nativeEcosystem', value)}
            value={record.nativeEcosystem}
            type='text'
          />
        </Grid>
        <Grid item xs={gridSize}>
          <MultiSelect
            id='successionalGroups'
            label={strings.SUCCESSIONAL_GROUP}
            fullWidth={true}
            onAdd={(successionalGroup: SuccessionalGroup) => {
              const selectedSuccessionalGroups = [...(record.successionalGroups ?? [])];
              selectedSuccessionalGroups.push(successionalGroup);
              onChange('successionalGroups', selectedSuccessionalGroups);
            }}
            onRemove={(successionalGroup: SuccessionalGroup) => {
              onChange('successionalGroups', record.successionalGroups?.filter((sg) => sg !== successionalGroup) ?? []);
            }}
            options={new Map(successionalGroups().map((sg) => [sg.value, sg.label]))}
            valueRenderer={(sgVal: string) => sgVal}
            selectedOptions={record.successionalGroups ?? []}
            placeHolder={strings.SELECT}
          />
        </Grid>
        <Grid item xs={gridSize}>
          <MultiSelect
            id='ecosystemTypes'
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
              const selectedTypes = [...(record.ecosystemTypes ?? [])];
              selectedTypes.push(type);
              onChange('ecosystemTypes', selectedTypes);
            }}
            onRemove={(type: EcosystemType) => {
              onChange('ecosystemTypes', record.ecosystemTypes?.filter((et) => et !== type) ?? []);
            }}
            options={new Map(ecosystemTypes().map((type) => [type.value, type.label]))}
            valueRenderer={(typeVal: string) => typeVal}
            selectedOptions={record.ecosystemTypes ?? []}
            placeHolder={strings.SELECT}
          />
        </Grid>
        <Grid item xs={gridSize}>
          <TextField
            id={'ecologicalRoleKnown'}
            label={strings.ECOLOGICAL_ROLE_KNOWN}
            onChange={(value) => onChange('ecologicalRoleKnown', value)}
            value={record.ecologicalRoleKnown}
            type='text'
            tooltipTitle={strings.ECOLOGICAL_ROLE_KNOWN_TOOLTIP}
          />
        </Grid>
        <Grid item xs={gridSize}>
          <TextField
            id={'localUsesKnown'}
            label={strings.LOCAL_USES_KNOWN}
            onChange={(value) => onChange('localUsesKnown', value)}
            value={record.localUsesKnown}
            type='text'
            tooltipTitle={strings.LOCAL_USES_KNOWN_TOOLTIP}
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
            id='plantMaterialSourcingMethods'
            fullWidth={true}
            label={strings.PLANT_MATERIAL_SOURCING_METHOD}
            onAdd={(method: PlantMaterialSourcingMethod) => {
              const selected = [...(record.plantMaterialSourcingMethods ?? [])];
              selected.push(method);
              onChange('plantMaterialSourcingMethods', selected);
            }}
            onRemove={(method: PlantMaterialSourcingMethod) => {
              onChange(
                'plantMaterialSourcingMethods',
                record.plantMaterialSourcingMethods?.filter((_method) => _method !== method) ?? []
              );
            }}
            options={new Map(plantMaterialSourcingMethods().map((type) => [type.value, type.label]))}
            valueRenderer={(val: string) => `${val}`}
            selectedOptions={record.plantMaterialSourcingMethods ?? []}
            placeHolder={strings.SELECT}
            tooltipTitle={
              <>
                <ul style={{ paddingLeft: '16px' }}>
                  <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEED_COLLECTION_AND_GERMINATION}</li>
                  <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEED_PURCHASE_AND_GERMINATION}</li>
                  <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_MANGROVE_PROPAGULES}</li>
                  <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_VEGETATIVE_PROPAGATION}</li>
                  <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_WILDLING_HARVEST}</li>
                  <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEEDLING_PURCHASE}</li>
                </ul>
              </>
            }
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 8}>
          <TextField
            id={'otherFacts'}
            label={strings.OTHER_FACTS}
            onChange={(value) => onChange('otherFacts', value)}
            value={record.otherFacts}
            type='textarea'
          />
        </Grid>
      </Grid>
    </>
  );
}
