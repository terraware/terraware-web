import { components } from "./generated-schema";

export type NotificationListResponse = components["schemas"]["NotificationListResponse"];
export type NotificationList = components["schemas"]["NotificationPayload"][];
export type NotificationType = components["schemas"]["NotificationPayload"]['type'];
