import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';

import { AddressAutofillFeatureSuggestion, AddressAutofillSuggestion } from '@mapbox/search-js-core';
import { Autocomplete, DropdownItem } from '@terraware/web-components';
import '@terraware/web-components/components/Autocomplete/styles.scss';
import '@terraware/web-components/components/Select/styles.scss';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import useMapboxSearch from 'src/utils/useMapboxSearch';

export type MapSearchBoxProp = {
  onSelect?: (features: AddressAutofillFeatureSuggestion[] | null) => void;
  style?: CSSProperties;
};

const MapSearchBox = ({ onSelect, style }: MapSearchBoxProp) => {
  const { activeLocale } = useLocalization();
  const { clear, retrieve, suggest, suggestResult, suggestText } = useMapboxSearch();
  const [value, setValue] = useState<string>('');
  const [debouncedValue, setDebouncedValue] = useState<string>('');

  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [options, setOptions] = React.useState<DropdownItem[]>([]);

  useEffect(() => {
    if (suggestResult) {
      setLoading(false);
      setOptions(
        suggestResult.map(
          (result): DropdownItem => ({
            label: `${result.feature_name}, ${result.full_address}`,
            value: result,
          })
        )
      );
    }
  }, [suggestResult]);

  const updateDebouncedValue = useCallback(
    (nextValue: string) => {
      if (debouncedValue !== nextValue) {
        setDebouncedValue(nextValue);
      }
    },
    [debouncedValue, setDebouncedValue]
  );

  useDebounce(value, 500, updateDebouncedValue);

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
        setLoading(true);
        setOptions([]);
        await suggest(searchText);
      }
    },
    [setLoading, setOptions, suggest, suggestText]
  );

  useEffect(() => {
    if (!debouncedValue) {
      if (suggestText) {
        clear();
      }
    } else {
      fetchSuggestions(debouncedValue);
    }
  }, [clear, debouncedValue, fetchSuggestions, suggestText]);

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

  const errorText = useMemo(() => {
    if (activeLocale && open && !loading && suggestText && options.length === 0) {
      return strings.NO_LOCATION_FOUND;
    }
  }, [activeLocale, open, loading, suggestText, options]);

  return (
    <Autocomplete
      id='mapbox-suggestions'
      sx={{ width: '100%', ...style }}
      errorText={errorText}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      loading={loading}
      loadingText={strings.LOADING}
      options={options}
      selected={value}
      onChange={onChange}
      placeholder={strings.ENTER_LOCATION}
      filterOptions={(options) => options} // Do not filter any options
      freeSolo
    />
  );
};

export default MapSearchBox;
