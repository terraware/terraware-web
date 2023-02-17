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

export type NotificationCriticality = 'Info' | 'Warning' | 'Error' | 'Success';

export type Notification = {
  id: number;
  notificationCriticality: NotificationCriticality;
  organizationId?: number;
  title: string;
  body: string | JSX.Element;
  localUrl: string;
  createdTime: string;
  isRead: boolean;
  hideDate?: boolean;
  markAsRead?: () => void;
};

export type Notifications = {
  items: Notification[];
};

export type NotificationsCount = {
  counts: NotificationCount[];
};
