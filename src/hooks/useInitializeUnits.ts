import { useEffect, useState } from 'react';

import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useUser } from 'src/providers';
import { InitializedUnits } from 'src/units';

// Guard so the default units are written at most once per session. Module-level (not a per-instance
// ref) so it dedupes across any concurrent mounts; reset only on failure so a failed write retries.
let unitsWriteStarted = false;

const useInitializeUnits = (defaultUnits: string): InitializedUnits => {
  const { bootstrapped, userPreferences } = useUser();
  const [result, setResult] = useState<InitializedUnits>({});
  const updateUserPreferences = useUpdateUserPreferences();

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    const unitsAcknowledgedOnMs = userPreferences.unitsAcknowledgedOnMs as number | undefined;
    const preferredWeightSystem = userPreferences.preferredWeightSystem as string | undefined;

    if (preferredWeightSystem) {
      setResult({ units: preferredWeightSystem, unitsAcknowledgedOnMs, updated: false });
      return;
    }

    if (unitsWriteStarted) {
      return;
    }

    unitsWriteStarted = true;
    void (async () => {
      try {
        await updateUserPreferences({ preferredWeightSystem: defaultUnits });
        setResult({ units: defaultUnits, unitsAcknowledgedOnMs, updated: true });
      } catch {
        unitsWriteStarted = false;
      }
    })();
  }, [bootstrapped, userPreferences, defaultUnits, updateUserPreferences]);

  return result;
};

export default useInitializeUnits;
