import React, { CSSProperties, useCallback, useEffect, useState } from 'react';

import { AddressAutofillFeatureSuggestion, AddressAutofillSuggestion } from '@mapbox/search-js-core';
import { Autocomplete, TextField } from '@mui/material';

import strings from 'src/strings';
import useMapboxSearch from 'src/utils/useMapboxSearch';

export type MapSearchBoxProp = {
  onSelect?: (features: AddressAutofillFeatureSuggestion[] | null) => void;
  style?: CSSProperties;
};

const MapSearchBox = ({ onSelect, style }: MapSearchBoxProp) => {
  const { clear, retrieve, suggest } = useMapboxSearch();
  const [value, setValue] = useState<AddressAutofillSuggestion>();
  const [inputValue, setInputValue] = useState<string>('');
  const [options, setOptions] = useState<AddressAutofillSuggestion[]>([]);

  const fetchSuggestions = useCallback(
    async (searchText: string) => {
      const results = await suggest(searchText);
      setOptions(results);
    },
    [suggest]
  );

  const onSelectSuggestion = useCallback(
    async (suggestion: AddressAutofillSuggestion | null) => {
      const results = suggestion ? await retrieve(suggestion) : null;
      if (onSelect) {
        onSelect(results);
      }
    },
    [retrieve]
  );

  useEffect(() => {
    if (inputValue === '') {
      clear();
      setOptions([]);
      return;
    }

    fetchSuggestions(inputValue);
  }, [clear, inputValue, value]);

  return (
    <Autocomplete
      id='mapbox-suggestions'
      sx={{ width: 1000, ...style }}
      getOptionLabel={(option: AddressAutofillSuggestion) => `${option.feature_name}, ${option.full_address}`}
      filterOptions={(x) => x}
      options={options}
      filterSelectedOptions
      value={value || null}
      noOptionsText='No locations'
      onChange={(event, newValue: AddressAutofillSuggestion | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue ?? undefined);
        onSelectSuggestion(newValue);
      }}
      onInputChange={(event, newInputValue: string) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => <TextField {...params} label={strings.LOCATION} fullWidth />}
    />
  );
};

export default MapSearchBox;
