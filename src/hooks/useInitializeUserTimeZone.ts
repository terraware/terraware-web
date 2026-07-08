import { useEffect, useRef, useState } from 'react';

import useUpdateCurrentUser from 'src/hooks/useUpdateCurrentUser';
import { useUser } from 'src/providers';
import { InitializedTimeZone } from 'src/types/TimeZones';

let timeZoneWriteInFlight = false;

const useInitializeUserTimeZone = (defaultTimeZone: string): InitializedTimeZone => {
  const { user, userPreferences } = useUser();
  const updateCurrentUser = useUpdateCurrentUser();
  const [result, setResult] = useState<InitializedTimeZone>({});
  const started = useRef(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const timeZoneAcknowledgedOnMs = userPreferences.timeZoneAcknowledgedOnMs as number | undefined;

    if (user.timeZone) {
      setResult({ timeZone: user.timeZone, timeZoneAcknowledgedOnMs, updated: false });
      return;
    }

    if (started.current || timeZoneWriteInFlight) {
      return;
    }

    started.current = true;
    timeZoneWriteInFlight = true;
    void (async () => {
      try {
        const succeeded = await updateCurrentUser(
          { ...user, timeZone: defaultTimeZone },
          { skipAcknowledgeTimeZone: true }
        );
        if (succeeded) {
          setResult({ timeZone: defaultTimeZone, timeZoneAcknowledgedOnMs, updated: true });
        } else {
          started.current = false;
        }
      } catch {
        started.current = false;
      } finally {
        timeZoneWriteInFlight = false;
      }
    })();
  }, [user, userPreferences, defaultTimeZone, updateCurrentUser]);

  return result;
};

export default useInitializeUserTimeZone;
