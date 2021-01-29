export type NotificationType = 'Alert' | 'Date' | 'State';

export interface NotificationPayload {
  id: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  text: string;
  accessionNumber: 'string';
  state: 'string';
}

export interface SimpleSuccessResponsePayload {
  status: string;
}

export interface SimpleErrorResponsePayload {
  status: string;
  error: ErrorDetails;
}

export interface ErrorDetails {
  message: string;
}

export interface NotificationListResponse {
  notifications: NotificationPayload[];
  status: string;
}
