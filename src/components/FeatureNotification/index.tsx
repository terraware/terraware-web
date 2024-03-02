import { useMemo } from 'react';

import { Notification } from 'src/types/Notifications';

import OrganizationNotification from './OrganizationNotification';
import UserNotification from './UserNotification';

export default function useFeatureNotifications(): Notification[] {
  const userNotification = UserNotification();
  const orgNotification = OrganizationNotification();

  return useMemo(
    () =>
      [
        // add all notifications here
        userNotification,
        orgNotification,
      ].filter((notification) => notification !== null) as Notification[],
    [
      // add all notification dependencies here
      userNotification,
      orgNotification,
    ]
  );
}
