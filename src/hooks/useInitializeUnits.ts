import { useEffect, useRef, useState } from 'react';

import { useUser } from 'src/providers';
import { PreferencesService } from 'src/services';
import { InitializedUnits } from 'src/units';

let unitsWriteInFlight = false;

const useInitializeUnits = (defaultUnits: string): InitializedUnits => {
  const { bootstrapped, userPreferences } = useUser();
  const [result, setResult] = useState<InitializedUnits>({});
  const started = useRef(false);

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

    if (started.current || unitsWriteInFlight) {
      return;
    }

    started.current = true;
    unitsWriteInFlight = true;
    void (async () => {
      try {
        const response = await PreferencesService.updateUserPreferences({ preferredWeightSystem: defaultUnits });
        if (response.requestSucceeded) {
          setResult({ units: defaultUnits, unitsAcknowledgedOnMs, updated: true });
        } else {
          started.current = false;
        }
      } catch {
        started.current = false;
      } finally {
        unitsWriteInFlight = false;
      }
    })();
  }, [bootstrapped, userPreferences, defaultUnits]);

  return result;
};

export default useInitializeUnits;
