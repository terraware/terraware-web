export type NotificationCount = {
  organizationId?: number;
  unread: number;
};

export type MarkNotificationRead = {
  read: boolean;
};

export type MarkNotificationsRead = {
  read: boolean;
  organizationId?: number;
};

export type NotificationType =
  | 'User Added to Organization'
  | 'Facility Idle'
  | 'Facility Alert Requested'
  | 'User Added to Project';

export type NotificationCriticality = 'Info' | 'Warning' | 'Error' | 'Success';

export type Notification = {
  id: number;
  notificationType: NotificationType;
  notificationCriticality: NotificationCriticality;
  organizationId?: number;
  title: string;
  body: string;
  localUrl: string;
  createdTime: string;
  isRead: boolean;
};

export type Notifications = {
  items: Notification[];
  errorOccurred: boolean;
};

export type NotificationsCount = {
  items: NotificationCount[];
  errorOccurred: boolean;
};
