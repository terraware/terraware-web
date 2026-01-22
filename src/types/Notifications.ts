import type { JSX } from 'react';

import { NotificationPayload } from 'src/queries/generated/notifications';

export type Notification = NotificationPayload;

export type ClientNotification = Omit<Notification, 'body'> & {
  body: string | JSX.Element;
  markAsRead: (read: boolean) => void;
};

export type NotificationCriticality = Notification['notificationCriticality'];
