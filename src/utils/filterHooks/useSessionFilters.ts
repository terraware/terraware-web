import { useCallback, useEffect, useState } from 'react';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  FiltersType,
  getFiltersFromQuery,
  getFiltersFromSession,
  resetQuery,
  writeFiltersToSession,
} from 'src/utils/filterHooks';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

export const useSessionFilters = (viewIdentifier?: string) => {
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const query = useQuery();

  const [localFilters, setLocalFilters] = useState<FiltersType>();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Sync filters to query and session, this happens when filters are changed within the consumer
  const _setLocalFilters = useCallback(
    (filters: FiltersType) => {
      if (viewIdentifier) {
        setLocalFilters(filters);

        writeFiltersToSession(viewIdentifier, filters);

        resetQuery(query, viewIdentifier);
        navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      }
    },
    [navigate, location, query, viewIdentifier]
  );

  // Query overrides session, pull filters from query and session, write merged filters back to session
  const init = useCallback(() => {
    if (isInitialized) {
      return;
    }

    if (viewIdentifier) {
      const currentQueryFilters = getFiltersFromQuery(query, viewIdentifier);
      const currentSessionFilters = getFiltersFromSession(viewIdentifier);

      const mergedFilters: FiltersType = {
        ...currentSessionFilters,
        ...currentQueryFilters,
      };

      setLocalFilters(mergedFilters);

      writeFiltersToSession(viewIdentifier, mergedFilters);

      if (Object.keys(currentQueryFilters).length) {
        resetQuery(query, viewIdentifier);
        navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      }

      setIsInitialized(true);
    }
  }, [navigate, isInitialized, location, query, viewIdentifier]);

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
