import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isArray } from 'src/types/utils';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import { denormalizeValue, filtersEqual, FiltersType, normalizeValue } from 'src/utils/filterHooks';

const isFilterKey = (key: string) => key.includes('_filter_');
const scrubFilterKey = (key: string) => key.replace(/[a-z]+_filter_(.+)/i, '$1');
const makeFilterKey = (viewIdentifier: string, key: string) => `${viewIdentifier}_filter_${key}`;

export const useQueryFilters = (viewIdentifier: string) => {
  const location = useStateLocation();
  const history = useHistory();
  const query = useQuery();
  const { sessionFilters, setSessionFilters } = useSessionFilters(viewIdentifier);

  const [queryFilters, setQueryFilters] = useState<FiltersType>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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
      console.log('filters', filters);
      setQueryFilters(filters);
      resetQuery();

      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (!value || (isArray(value) && value.length === 0)) {
          return;
        }

        const queryKey = makeFilterKey(viewIdentifier, key);
        console.log('queryKey, normalizeValue(value)', queryKey, normalizeValue(value));
        query.set(queryKey, normalizeValue(value));
      });

      history.replace(getLocation(location.pathname, location, query.toString()));
    },
    [history, location, query, resetQuery, viewIdentifier]
  );

  // Sync from session
  useEffect(() => {
    console.log('queryFilters, sessionFilters', queryFilters, sessionFilters);
    if (!filtersEqual(queryFilters, sessionFilters)) {
      setQueryFilters(sessionFilters);
    }
  }, [queryFilters, sessionFilters]);

  // Sync from query
  const init = useCallback(() => {
    if (isInitialized) {
      return;
    }

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

    console.log('queryKeys', queryKeys);
    queryKeys
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        if (isFilterKey(key)) {
          const value = query.get(key);
          console.log('value', value);
          if (!value) {
            return;
          }

          const filterKey = scrubFilterKey(key);
          currentQueryFilters[filterKey] = denormalizeValue(value);
        }
      });

    console.log('currentQueryFilters', currentQueryFilters);
    setQueryFilters(currentQueryFilters);
    setSessionFilters(currentQueryFilters);

    setIsInitialized(true);
  }, [query, setSessionFilters, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    init();
    setIsInitialized(true);
  }, [init, isInitialized]);

  return { queryFilters, setQueryFilters: _setQueryFilters };
};
