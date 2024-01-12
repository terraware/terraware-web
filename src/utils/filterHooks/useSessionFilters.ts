import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import {
  FiltersType,
  getFiltersFromQuery,
  getFiltersFromSession,
  resetQuery,
  writeFiltersToQuery,
  writeFiltersToSession,
} from 'src/utils/filterHooks';

export const useSessionFilters = (viewIdentifier: string, writeToQuery = true) => {
  const location = useStateLocation();
  const history = useHistory();
  const query = useQuery();

  const [localFilters, setLocalFilters] = useState<FiltersType>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Sync filters to query and session, this happens when filters are changed within the consumer
  const _setLocalFilters = useCallback(
    (filters: FiltersType) => {
      setLocalFilters(filters);

      writeFiltersToSession(viewIdentifier, filters);

      resetQuery(query, viewIdentifier);
      writeFiltersToQuery(query, viewIdentifier, filters);
      history.replace(getLocation(location.pathname, location, query.toString()));
    },
    [history, location, query, viewIdentifier]
  );

  // Query overrides session, pull filters from query and session, write merged filters back to session
  const init = useCallback(() => {
    if (isInitialized) {
      return;
    }

    const currentQueryFilters = getFiltersFromQuery(query, viewIdentifier);
    const currentSessionFilters = getFiltersFromSession(viewIdentifier);

    const mergedFilters: FiltersType = {
      ...currentSessionFilters,
      ...currentQueryFilters,
    };

    setLocalFilters(mergedFilters);

    writeFiltersToSession(viewIdentifier, mergedFilters);

    writeFiltersToQuery(query, viewIdentifier, mergedFilters);
    history.replace(getLocation(location.pathname, location, query.toString()));

    setIsInitialized(true);
  }, [history, isInitialized, location, query, viewIdentifier]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    init();
    setIsInitialized(true);
  }, [init, isInitialized]);

  return {
    sessionFilters: localFilters,
    setSessionFilters: _setLocalFilters,
  };
};
