import { useMemo } from 'react';

import { ClientNotification } from 'src/types/Notifications';

import useOrganizationNotification from './useOrganizationNotification';
import useUserNotification from './useUserNotification';

export default function useClientNotifications(): ClientNotification[] {
  const userNotification = useUserNotification();
  const orgNotification = useOrganizationNotification();

  return useMemo(
    () =>
      [
        // add all notifications here
        userNotification,
        orgNotification,
      ].filter((notification) => notification !== null) as ClientNotification[],
    [
      // add all notification dependencies here
      userNotification,
      orgNotification,
    ]
  );
}
