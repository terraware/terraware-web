import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { getAllSpecies } from 'src/api/species/species';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import { SelectT } from '@terraware/web-components';
import useDebounce from 'src/utils/useDebounce';

interface SpeciesDropdownProps<T extends AccessionPostRequestBody> {
  speciesId?: number;
  organization: ServerOrganization;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
}

export default function SpeciesDropdown<T extends AccessionPostRequestBody>(
  props: SpeciesDropdownProps<T>
): JSX.Element {
  const { speciesId, organization, setRecord, disabled } = props;
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedValue, setSelectedValue] = useState<Species>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const populateSpecies = useCallback(async () => {
    const response = await getAllSpecies(organization.id);
    if (response.requestSucceeded) {
      const searchValue = debouncedSearchTerm ? debouncedSearchTerm.toLowerCase() : '';
      const speciesToUse = searchValue
        ? response.species.filter((species) => {
            return (
              species.scientificName.toLowerCase().includes(searchValue) ||
              (species.commonName && species.commonName.toLowerCase().includes(searchValue))
            );
          })
        : response.species;
      setSpeciesList(speciesToUse);
    }
  }, [organization, debouncedSearchTerm]);

  useEffect(() => {
    populateSpecies();
  }, [organization, populateSpecies]);

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
          readonly={false}
        />
      </Grid>
    </>
  );
}
