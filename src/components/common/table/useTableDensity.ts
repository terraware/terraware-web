import { useCallback, useEffect, useMemo, useState } from 'react';

import { TableDensityType } from '@terraware/web-components/components/table/types';

import { useUser } from 'src/providers';

export type Response = {
  tableDensity: TableDensityType;
  setTableDensity: (density: TableDensityType) => void;
};

/**
 * Hook to keep one centralized state for table density. It is synced with user preference in the database, but will
 * update before the API round trip completes.
 */
const useTableDensity = (): Response => {
  const { updateUserPreferences, userPreferences, reloadUserPreferences } = useUser();

  const [tableDensity, _setTableDensity] = useState<TableDensityType>(
    (userPreferences['tableDensity'] as TableDensityType) ?? 'comfortable'
  );

  const saveTableDensityToUserPreferences = (newDensity: TableDensityType) => {
    updateUserPreferences({ tableDensity: newDensity });
    reloadUserPreferences();
  };

  useEffect(() => {
    // Load table density from userPreference. Set state if different.
    const newTableDensity = (userPreferences['tableDensity'] ?? 'comfortable') as TableDensityType;
    if (tableDensity !== newTableDensity) {
      _setTableDensity(newTableDensity);
    }
  }, [userPreferences['tableDensity']]);

  const setTableDensity = useCallback((density: TableDensityType) => {
    _setTableDensity(density);
    saveTableDensityToUserPreferences(density);
  }, []);

  const result = useMemo<Response>(
    () => ({
      tableDensity,
      setTableDensity,
    }),
    [tableDensity, setTableDensity]
  );

  return result;
};

export default useTableDensity;
