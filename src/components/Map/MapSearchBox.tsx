import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';

import { AddressAutofillFeatureSuggestion, AddressAutofillSuggestion } from '@mapbox/search-js-core';
import { Autocomplete, DropdownItem } from '@terraware/web-components';
import '@terraware/web-components/components/Autocomplete/styles.scss';
import '@terraware/web-components/components/Select/styles.scss';

import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import useMapboxSearch from 'src/utils/useMapboxSearch';

export type MapSearchBoxProp = {
  onSelect?: (features: AddressAutofillFeatureSuggestion[] | null) => void;
  style?: CSSProperties;
};

const MapSearchBox = ({ onSelect, style }: MapSearchBoxProp) => {
  const { clear, retrieve, suggest, suggestResult, suggestText } = useMapboxSearch();
  const [value, setValue] = useState<string>('');

  const options = useMemo(
    () =>
      suggestResult.map(
        (result): DropdownItem => ({
          label: `${result.feature_name}, ${result.full_address}`,
          value: result,
        })
      ),
    [suggestResult]
  );

  const debouncedValue = useDebounce(value, 500);

  const onSelectSuggestion = useCallback(
    async (suggestion: AddressAutofillSuggestion | null) => {
      const results = suggestion ? await retrieve(suggestion) : null;
      if (onSelect) {
        onSelect(results);
      }
    },
    [retrieve]
  );

  const fetchSuggestions = useCallback(
    async (searchText: string) => {
      if (searchText !== suggestText) {
        await suggest(searchText);
      }
    },
    [suggest, suggestText]
  );

  useEffect(() => {
    if (!debouncedValue) {
      clear();
    } else {
      fetchSuggestions(debouncedValue);
    }
  }, [clear, debouncedValue, fetchSuggestions]);

  const onChange = useCallback(
    (value: string | DropdownItem | undefined) => {
      if (typeof value === 'string') {
        // When user types in the search box
        setValue(value);
      } else if (value === undefined) {
        // When user clears the value
        setValue('');
      } else {
        // When user selects from the dropdown option
        setValue(value.label);
        onSelectSuggestion(value.value);
      }
    },
    [setValue, onSelectSuggestion]
  );

  return (
    <Autocomplete
      id='mapbox-suggestions'
      sx={{ width: '100%', ...style }}
      options={options}
      selected={value}
      onChange={onChange}
      placeholder={strings.ENTER_LOCATION}
      freeSolo
    />
  );
};

export default MapSearchBox;
