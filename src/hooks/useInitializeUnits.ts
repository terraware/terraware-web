import { useEffect, useRef, useState } from 'react';

import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useUser } from 'src/providers';
import { InitializedUnits } from 'src/units';

let unitsWriteInFlight = false;

const useInitializeUnits = (defaultUnits: string): InitializedUnits => {
  const { bootstrapped, userPreferences } = useUser();
  const [result, setResult] = useState<InitializedUnits>({});
  const started = useRef(false);
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

    if (started.current || unitsWriteInFlight) {
      return;
    }

    started.current = true;
    unitsWriteInFlight = true;
    void (async () => {
      try {
        await updateUserPreferences({ preferredWeightSystem: defaultUnits });
        setResult({ units: defaultUnits, unitsAcknowledgedOnMs, updated: true });
      } catch {
        started.current = false;
      } finally {
        unitsWriteInFlight = false;
      }
    })();
  }, [bootstrapped, userPreferences, defaultUnits, updateUserPreferences]);

  return result;
};

export default useInitializeUnits;
