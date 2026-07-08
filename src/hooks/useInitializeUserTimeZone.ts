import { useEffect, useState } from 'react';

import useUpdateCurrentUser from 'src/hooks/useUpdateCurrentUser';
import { useUser } from 'src/providers';
import { InitializedTimeZone } from 'src/types/TimeZones';

// Guard so the default time zone is written at most once per session, even across the multiple hook
// instances that mount together (the user + organization notification hooks). Module-level (not a
// per-instance ref) so it dedupes across instances; reset only on failure so a failed write retries.
let timeZoneWriteStarted = false;

const useInitializeUserTimeZone = (defaultTimeZone: string): InitializedTimeZone => {
  const { user, userPreferences } = useUser();
  const updateCurrentUser = useUpdateCurrentUser();
  const [result, setResult] = useState<InitializedTimeZone>({});

  useEffect(() => {
    if (!user) {
      return;
    }

    const timeZoneAcknowledgedOnMs = userPreferences.timeZoneAcknowledgedOnMs as number | undefined;

    if (user.timeZone) {
      setResult({ timeZone: user.timeZone, timeZoneAcknowledgedOnMs, updated: false });
      return;
    }

    if (timeZoneWriteStarted) {
      return;
    }

    timeZoneWriteStarted = true;
    void (async () => {
      try {
        const succeeded = await updateCurrentUser(
          { ...user, timeZone: defaultTimeZone },
          { skipAcknowledgeTimeZone: true }
        );
        if (succeeded) {
          setResult({ timeZone: defaultTimeZone, timeZoneAcknowledgedOnMs, updated: true });
        } else {
          timeZoneWriteStarted = false;
        }
      } catch {
        timeZoneWriteStarted = false;
      }
    })();
  }, [user, userPreferences, defaultTimeZone, updateCurrentUser]);

  return result;
};

export default useInitializeUserTimeZone;
