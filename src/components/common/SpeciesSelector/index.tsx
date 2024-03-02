import React, { useCallback, useEffect, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import { useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { SuggestedSpecies } from 'src/types/Species';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';

interface SpeciesSelectorProps<T extends { speciesId?: number } | undefined> {
  speciesId?: number;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>> | ((setFn: (previousValue: T) => T) => void);
  disabled?: boolean;
  validate?: boolean;
  tooltipTitle?: string;
}

export default function SpeciesSelector<T extends { speciesId?: number } | undefined>(
  props: SpeciesSelectorProps<T>
): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { speciesId, record, setRecord, disabled, validate, tooltipTitle } = props;
  const [speciesList, setSpeciesList] = useState<SuggestedSpecies[]>([]);
  const [selectedValue, setSelectedValue] = useState<SuggestedSpecies>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const populateSpecies = useCallback(
    async (searchTerm: string) => {
      const requestId = Math.random().toString();
      setRequestId('speciesSelectorSearch', requestId);
      const response: SuggestedSpecies[] | null = await SpeciesService.suggestSpecies(
        selectedOrganization.id,
        searchTerm
      );
      if (response && getRequestId('speciesSelectorSearch') === requestId) {
        setSpeciesList(response.sort((a, b) => a.scientificName.localeCompare(b.scientificName)));
      }
    },
    [selectedOrganization.id]
  );

  useEffect(() => {
    populateSpecies(debouncedSearchTerm);
  }, [populateSpecies, debouncedSearchTerm]);

  useEffect(() => {
    if (speciesId && !selectedValue) {
      const foundSpecies = speciesList.find((species) => species?.id?.toString() === speciesId.toString());
      if (foundSpecies) {
        setSelectedValue(foundSpecies);
      }
    }
  }, [speciesList, selectedValue, speciesId]);

  const onChangeHandler = (value: SuggestedSpecies) => {
    setSelectedValue(value);
    if (value?.id) {
      setRecord((previousRecord: T): T => {
        return {
          ...previousRecord,
          speciesId: Number(value.id),
        };
      });
    } else if (value.scientificName !== undefined) {
      setTemporalSearchValue(value.scientificName);
    }
  };

  const isEqual = (A: SuggestedSpecies, B: SuggestedSpecies) => {
    return A?.scientificName === B?.scientificName && A.id !== undefined && B.id !== undefined;
  };

  const toT = (option: string) => {
    return { scientificName: option } as SuggestedSpecies;
  };

  const renderOption = (option: SuggestedSpecies) => {
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
        <SelectT<SuggestedSpecies>
          id='speciesSelector'
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
          errorText={validate && !record?.speciesId ? strings.REQUIRED_FIELD : ''}
          tooltipTitle={tooltipTitle}
          fixedMenu={true}
        />
      </Grid>
    </>
  );
}
