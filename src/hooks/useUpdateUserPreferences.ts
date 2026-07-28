import { useCallback } from 'react';

import { useLazyGetUserPreferencesQuery, useUpdateUserPreferencesMutation } from 'src/queries/generated/preferences';

const useUpdateUserPreferences = () => {
  const [getPreferences] = useLazyGetUserPreferencesQuery();
  const [putPreferences] = useUpdateUserPreferencesMutation();

  return useCallback(
    async (toUpdate: Record<string, unknown>, organizationId?: number): Promise<Record<string, unknown>> => {
      const current = await getPreferences(organizationId).unwrap();
      const preferences = { ...(current.preferences ?? {}), ...toUpdate };
      await putPreferences({ organizationId, preferences }).unwrap();
      return preferences;
    },
    [getPreferences, putPreferences]
  );
};

export default useUpdateUserPreferences;
