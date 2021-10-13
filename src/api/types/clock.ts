import { paths } from './generated-schema';

export const clockEndpoint = '/api/v1/seedbank/clock';
export type ClockGetResponse = paths[typeof clockEndpoint]['get']['responses'][200]['content']['application/json'];
