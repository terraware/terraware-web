import { useEffect, useState } from 'react';

import { useUser } from 'src/providers';
import { PreferencesService } from 'src/services';
import { InitializedUnits } from 'src/units';

// Guard so the default units are written at most once per session. Module-level (not a per-instance
// ref) so it dedupes across any concurrent mounts; reset only on failure so a failed write retries.
let unitsWriteStarted = false;

const useInitializeUnits = (defaultUnits: string): InitializedUnits => {
  const { bootstrapped, userPreferences } = useUser();
  const [result, setResult] = useState<InitializedUnits>({});

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
        const response = await PreferencesService.updateUserPreferences({ preferredWeightSystem: defaultUnits });
        if (response.requestSucceeded) {
          setResult({ units: defaultUnits, unitsAcknowledgedOnMs, updated: true });
        } else {
          unitsWriteStarted = false;
        }
      } catch {
        unitsWriteStarted = false;
      }
    })();
  }, [bootstrapped, userPreferences, defaultUnits]);

  return result;
};

export default useInitializeUnits;
