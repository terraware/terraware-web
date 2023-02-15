import { DateTime } from 'luxon';

export const featureNotificationExpired = (preferenceTimestamp: number | undefined) =>
  preferenceTimestamp && DateTime.now().plus({ days: -30 }).toMillis() > preferenceTimestamp; // see > instead of <=
