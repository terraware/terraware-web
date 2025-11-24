import { useMemo } from 'react';

import { ClientNotification } from 'src/types/Notifications';

import OrganizationNotification from './OrganizationNotification';
import UserNotification from './UserNotification';

export default function useClientNotifications(): ClientNotification[] {
  const userNotification = UserNotification();
  const orgNotification = OrganizationNotification();

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
