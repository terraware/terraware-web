import React, { CSSProperties, useCallback, useEffect, useState } from 'react';

import { AddressAutofillFeatureSuggestion, AddressAutofillSuggestion } from '@mapbox/search-js-core';
import { Autocomplete, DropdownItem } from '@terraware/web-components';
import '@terraware/web-components/components/Autocomplete/styles.scss';
import '@terraware/web-components/components/Select/styles.scss';

import strings from 'src/strings';
import useMapboxSearch from 'src/utils/useMapboxSearch';

export type MapSearchBoxProp = {
  onSelect?: (features: AddressAutofillFeatureSuggestion[] | null) => void;
  style?: CSSProperties;
};

const MapSearchBox = ({ onSelect, style }: MapSearchBoxProp) => {
  const { clear, retrieve, suggest } = useMapboxSearch();
  const [value, setValue] = useState<string>('');
  const [options, setOptions] = useState<DropdownItem[]>([]);

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
      const results = await suggest(searchText);
      const nextOptions = results.map((result): DropdownItem => {
        return {
          label: `${result.feature_name}, ${result.full_address}`,
          value: result,
        };
      });
      setOptions(nextOptions);
    },
    [setOptions, suggest, onSelectSuggestion]
  );

  useEffect(() => {
    if (!value) {
      clear();
      setOptions([]);
      return;
    } else {
      fetchSuggestions(value);
    }
  }, [clear, value]);

  const onChange = useCallback(
    (value: string | DropdownItem | undefined) => {
      if (typeof value === 'string') {
        setValue(value);
      } else if (value === undefined) {
        setValue('');
      } else {
        setValue(value.label);
        onSelectSuggestion(value.value);
      }
    },
    [setValue, onSelectSuggestion]
  );

  return (
    <Autocomplete
      id='mapbox-suggestions'
      sx={{ width: 1000, ...style }}
      options={options}
      selected={value}
      onChange={onChange}
      placeholder={strings.ENTER_LOCATION}
      freeSolo
    />
  );
};

export default MapSearchBox;
