import _ from 'lodash';
import { isArray } from 'src/types/utils';

type FilterValue = (string | number | null)[] | boolean | null;
export type FiltersType = Record<string, FilterValue>;

// Convert an array to a comma separated string and other values to a string
// Array values are sorted, so we can detect equality easier elsewhere
export const normalizeValue = (value: FilterValue): string => {
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

export const isFilterKey = (viewIdentifier: string, key: string) => key.includes(`${viewIdentifier}_filter_`);
export const scrubFilterKey = (key: string) => key.replace(/[a-z]+_filter_(.+)/i, '$1');
export const makeFilterKey = (viewIdentifier: string, key: string) => `${viewIdentifier}_filter_${key}`;
export const makeFiltersSessionKey = (viewIdentifier: string) => `${viewIdentifier}_filters`;

export const getFiltersFromSession = (viewIdentifier: string): FiltersType => {
  try {
    return JSON.parse(sessionStorage.getItem(makeFiltersSessionKey(viewIdentifier)) || '{}');
  } catch (e) {
    return {};
  }
};

export const writeFiltersToSession = (viewIdentifier: string, filters: FiltersType): void => {
  try {
    sessionStorage.setItem(makeFiltersSessionKey(viewIdentifier), JSON.stringify(filters));
    // tslint:disable-next-line:no-empty
  } catch (e) {}
};

export const getFiltersFromQuery = (query: URLSearchParams, viewIdentifier: string): FiltersType => {
  const queryFilters: FiltersType = {};
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
      if (isFilterKey(viewIdentifier, key)) {
        const value = query.get(key);
        if (!value) {
          return;
        }

        queryFilters[scrubFilterKey(key)] = denormalizeValue(value);
      }
    });

  return queryFilters;
};

export const writeFiltersToQuery = (query: URLSearchParams, viewIdentifier: string, filters: FiltersType): void => {
  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    if (!value || (isArray(value) && value.length === 0)) {
      return;
    }

    query.set(makeFilterKey(viewIdentifier, key), normalizeValue(value));
  });
};

export const resetQuery = (query: URLSearchParams, viewIdentifier: string): void => {
  query.forEach((value, key) => {
    if (isFilterKey(viewIdentifier, key)) {
      query.delete(key);
    }
  });
};
