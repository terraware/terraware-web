export enum NotificationTypes {
  'Alert' = 0,
  'State' = 1,
  'Date' = 2,
}

export type Notification = {
  id: string;
  timestamp: string;
  type: NotificationTypes;
  read: boolean;
  text: string;
  accessionId?: number;
  state?:
    | 'Awaiting Check-In'
    | 'Pending'
    | 'Processing'
    | 'Processed'
    | 'Drying'
    | 'Dried'
    | 'In Storage'
    | 'Withdrawn'
    | 'Nursery';
};

export type Notifications = {
  items: Notification[];
  errorOccurred: boolean;
};
