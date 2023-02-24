import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { AccessionPostRequestBody } from 'src/services/SeedBankService';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { SelectT } from '@terraware/web-components';
import useDebounce from 'src/utils/useDebounce';
import { useOrganization } from 'src/providers/hooks';
import { removeDiacritics } from 'src/utils/text';
import { SpeciesService } from 'src/services';

interface SpeciesDropdownProps<T extends AccessionPostRequestBody> {
  speciesId?: number;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
  validate?: boolean;
}

export default function Species2Dropdown<T extends AccessionPostRequestBody>(
  props: SpeciesDropdownProps<T>
): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { speciesId, record, setRecord, disabled, validate } = props;
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedValue, setSelectedValue] = useState<Species>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const populateSpecies = useCallback(async () => {
    const response = await SpeciesService.getAllSpecies(selectedOrganization.id);
    if (response.requestSucceeded && response.species) {
      const searchValue = debouncedSearchTerm ? removeDiacritics(debouncedSearchTerm).toLowerCase() : '';
      const speciesToUse = searchValue
        ? response.species.filter((species) => {
            return (
              species.scientificName.toLowerCase().includes(searchValue) ||
              (species.commonName && removeDiacritics(species.commonName).toLowerCase().includes(searchValue))
            );
          })
        : response.species;
      setSpeciesList(speciesToUse);
    }
  }, [selectedOrganization, debouncedSearchTerm]);

  useEffect(() => {
    populateSpecies();
  }, [selectedOrganization, populateSpecies]);

  useEffect(() => {
    if (speciesId && !selectedValue) {
      const foundSpecies = speciesList.find((species) => species.id === speciesId);
      if (foundSpecies) {
        setSelectedValue(foundSpecies);
      }
    }
  }, [speciesList, selectedValue, speciesId]);

  const onChangeHandler = (value: Species) => {
    setSelectedValue(value);
    if (value?.id) {
      setRecord((previousRecord: T): T => {
        return {
          ...previousRecord,
          speciesId: value.id,
        };
      });
    } else if (value.scientificName !== undefined) {
      setTemporalSearchValue(value.scientificName);
    }
  };

  const isEqual = (A: Species, B: Species) => {
    return A?.scientificName === B?.scientificName && A.id !== undefined && B.id !== undefined;
  };

  const toT = (option: string) => {
    return { scientificName: option } as Species;
  };

  const renderOption = (option: Species) => {
    return (
      <div>
        <Typography component='p' sx={{ fontStyle: 'italic', display: 'inline-block' }}>
          {option.scientificName}
        </Typography>
        &nbsp;
        {option.commonName && (
          <Typography component='p' sx={{ display: 'inline-block' }}>
            ({option.commonName})
          </Typography>
        )}
      </div>
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <SelectT<Species>
          id='species'
          label={strings.SPECIES_REQUIRED}
          disabled={disabled}
          placeholder={strings.SEARCH_OR_SELECT}
          options={speciesList}
          onChange={onChangeHandler}
          isEqual={isEqual}
          renderOption={renderOption}
          displayLabel={(species) => species?.scientificName || ''}
          selectedValue={selectedValue}
          toT={toT}
          fullWidth={true}
          editable={true}
          errorText={validate && !record.speciesId ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
    </>
  );
}
