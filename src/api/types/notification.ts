import { components } from "./generated-schema";

export type Notifications = components["schemas"]["NotificationListResponse"]["notifications"];
export type NotificationList = components["schemas"]["NotificationPayload"][];
export type NotificationType = components["schemas"]["NotificationPayload"]['type'];
