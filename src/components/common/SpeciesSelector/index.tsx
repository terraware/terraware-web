import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { useSearchSpeciesSuggestionsQuery } from 'src/queries/search/species';
import strings from 'src/strings';
import { SuggestedSpecies } from 'src/types/Species';
import useDebounce from 'src/utils/useDebounce';

interface SpeciesSelectorProps<T extends { speciesId?: number } | undefined> {
  speciesId?: number;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>> | ((setFn: (previousValue: T) => T) => void);
  disabled?: boolean;
  validate?: boolean;
  tooltipTitle?: string;
  hideLabel?: boolean;
  id?: string;
}

export default function SpeciesSelector<T extends { speciesId?: number } | undefined>(
  props: SpeciesSelectorProps<T>
): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { speciesId, record, setRecord, disabled, validate, tooltipTitle, hideLabel, id } = props;
  const [selectedValue, setSelectedValue] = useState<SuggestedSpecies>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  const { data: suggestedSpecies } = useSearchSpeciesSuggestionsQuery(
    { organizationId: selectedOrganization?.id ?? -1, query: debouncedSearchTerm },
    // Species can change outside RTK Query (e.g. CSV imports), so fetch fresh suggestions on mount.
    { skip: !selectedOrganization, refetchOnMountOrArgChange: true }
  );
  const speciesList = useMemo(
    () => [...(suggestedSpecies ?? [])].sort((a, b) => a.scientificName.localeCompare(b.scientificName)),
    [suggestedSpecies]
  );

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
      <Grid size={12}>
        <SelectT<SuggestedSpecies>
          id={id ?? 'speciesSelector'}
          label={hideLabel ? '' : strings.SPECIES_REQUIRED}
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
