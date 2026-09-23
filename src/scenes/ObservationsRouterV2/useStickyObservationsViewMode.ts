import { useCallback, useEffect, useMemo, useState } from 'react';

import { useUser } from 'src/providers';
import { PreferencesType } from 'src/providers/DataTypes';

import { ViewMode } from './ObservationFiltersProvider';

const VIEW_MODES: ViewMode[] = ['map', 'split', 'list'];
const VIEW_MODE_PREFERENCE = 'observationsViewMode';

const readViewMode = (preferences: PreferencesType): ViewMode | undefined => {
  const stored = preferences[VIEW_MODE_PREFERENCE];
  return VIEW_MODES.includes(stored as ViewMode) ? (stored as ViewMode) : undefined;
};

/** The map, split or list choice, kept in the user's preferences. */
const useStickyObservationsViewMode = () => {
  const { updateUserPreferences, userPreferences } = useUser();

  // Starting from the stored value keeps split from mounting both halves before being corrected.
  const [viewMode, setViewModeState] = useState<ViewMode>(() => readViewMode(userPreferences) ?? 'split');

  const storedViewMode = useMemo(() => readViewMode(userPreferences), [userPreferences]);

  useEffect(() => {
    if (storedViewMode !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewModeState(storedViewMode);
    }
  }, [storedViewMode]);

  const setViewMode = useCallback(
    (nextViewMode: ViewMode) => {
      setViewModeState(nextViewMode);
      void updateUserPreferences({ [VIEW_MODE_PREFERENCE]: nextViewMode });
    },
    [updateUserPreferences]
  );

  return { setViewMode, viewMode };
};

export default useStickyObservationsViewMode;
