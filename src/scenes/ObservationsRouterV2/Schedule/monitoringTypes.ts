import { ScheduleObservationRequestPayload } from 'src/queries/generated/observations';

export type MonitoringType = NonNullable<ScheduleObservationRequestPayload['observationType']>;

export const MONITORING_TYPES: MonitoringType[] = ['Monitoring', 'Biomass Measurements'];
