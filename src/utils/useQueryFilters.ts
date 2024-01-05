import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isArray } from 'src/types/utils';

type FilterValue = (string | number | null)[] | boolean | null;
export type FiltersType = Record<string, FilterValue>;

// Convert an array to a comma separated string and other values to a string
// Array values are sorted, so we can detect equality easier elsewhere
const normalizeValue = (value: FilterValue): string => {
  if (isArray(value)) {
    return value
      .sort((valueA, valueB) => `${valueA}`.localeCompare(`${valueB}`))
      .map((_value) => `${_value}`)
      .join(',');
  } else if (value === null) {
    return '';
  } else {
    return `${value}`;
  }
};

const denormalizeNumber = (value: string): number | string =>
  value.match(/^[0-9]+$/) && `${Number(value)}` === value ? _.toFinite(value) : value;

export const denormalizeValue = (value: string): FilterValue => {
  switch (value.toLowerCase()) {
    case 'true': {
      return true;
    }
    case 'false': {
      return false;
    }
    case '':
    case 'null': {
      return null;
    }
    default: {
      if (value.includes(',')) {
        return value.split(',').map(denormalizeNumber);
      }
      return [denormalizeNumber(value)];
    }
  }
};

const filterValueEqual = (a: FilterValue, b: FilterValue) => normalizeValue(a) === normalizeValue(b);

const isEmptyArray = (value: FilterValue) => isArray(value) && !value.length;

export const filtersEqual = (a: FiltersType, b: FiltersType) =>
  Object.keys(a).every((key) => (isEmptyArray(a[key]) && !b[key]) || filterValueEqual(a[key], b[key])) &&
  Object.keys(b).every((key) => (isEmptyArray(b[key]) && !a[key]) || filterValueEqual(a[key], b[key]));

const isFilterKey = (key: string) => key.includes('filter_');
const scrubFilterKey = (key: string) => key.replace('filter_', '');
const makeFilterKey = (key: string) => `filter_${key}`;

export const useQueryFilters = () => {
  const location = useStateLocation();
  const history = useHistory();
  const query = useQuery();

  const [queryFilters, setQueryFilters] = useState<FiltersType>({});

  const resetQuery = useCallback(() => {
    query.forEach((value, key) => {
      if (isFilterKey(key)) {
        query.delete(key);
      }
    });
  }, [query]);

  // Sync filters to query
  const _setQueryFilters = useCallback(
    (filters: FiltersType) => {
      setQueryFilters(filters);
      resetQuery();

      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (!value || (isArray(value) && value.length === 0)) {
          return;
        }

        const queryKey = makeFilterKey(key);
        query.set(queryKey, normalizeValue(value));
      });

      history.replace(getLocation(location.pathname, location, query.toString()));
    },
    [history, location, query, resetQuery]
  );

  // Sync from query
  useEffect(() => {
    const currentQueryFilters: FiltersType = {};

    const queryKeys: string[] = [];

    const keysIter = query.keys();
    let keyPos = keysIter.next();

    while (!keyPos.done) {
      if (query.get(keyPos.value)) {
        queryKeys.push(keyPos.value);
      }
      keyPos = keysIter.next();
    }

    queryKeys
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        if (isFilterKey(key)) {
          const value = query.get(key);
          if (!value) {
            return;
          }

          const filterKey = scrubFilterKey(key);
          currentQueryFilters[filterKey] = denormalizeValue(value);
        }
      });

    if (!filtersEqual(queryFilters, currentQueryFilters)) {
      setQueryFilters(currentQueryFilters);
    }
  }, [query, queryFilters]);

  return { queryFilters, setQueryFilters: _setQueryFilters };
};
