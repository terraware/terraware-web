import UserNotification from './UserNotification';
import { Notification } from 'src/types/Notifications';
import OrganizationNotification from './OrganizationNotification';

export default function useFeatureNotifications(): Notification[] {
  const featureNotifications: Notification[] = [];

  const userNotification = UserNotification();

  if (userNotification) {
    featureNotifications.push(userNotification);
  }

  const orgNotification = OrganizationNotification();

  if (orgNotification) {
    featureNotifications.push(orgNotification);
  }

  return featureNotifications;
}
