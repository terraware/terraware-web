import { DateTime } from 'luxon';

import { ObservationPayload } from 'src/queries/generated/observations';

export const buildObservation = (overrides: Partial<ObservationPayload> = {}): ObservationPayload => ({
  endDate: DateTime.now().plus({ days: 37 }).toISODate()!,
  id: 1,
  isAdHoc: false,
  numIncompletePlots: 0,
  numPlots: 0,
  numUnclaimedPlots: 0,
  plantingSiteId: 1,
  plantingSiteName: 'Test Planting Site',
  startDate: DateTime.now().plus({ days: 7 }).toISODate()!,
  state: 'Upcoming',
  type: 'Monitoring',
  ...overrides,
});
