export type TimeZoneDescription = {
  id: string;
  longName: string;
};

export type InitializedTimeZone = {
  timeZone?: string;
  timeZoneAcknowledgedOnMs?: number;
  updated?: boolean;
};
