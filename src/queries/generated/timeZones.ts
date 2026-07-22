import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listTimeZoneNames: build.query<ListTimeZoneNamesApiResponse, ListTimeZoneNamesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/i18n/timeZones`,
        params: {
          locale: queryArg,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListTimeZoneNamesApiResponse = /** status 200 OK */ ListTimeZoneNamesResponsePayload;
export type ListTimeZoneNamesApiArg =
  /** Language code and optional country code suffix. If not specified, the preferred locale from the Accept-Language header is used if supported; otherwise US English is the default. */
    | string
    | undefined;
export type SuccessOrError = 'ok' | 'error';
export type TimeZonePayload = {
  /** Time zone name in IANA tz database format */
  id: string;
  /** Long name of time zone, possibly including a city name. This name is guaranteed to be unique across all zones. */
  longName: string;
};
export type ListTimeZoneNamesResponsePayload = {
  status: SuccessOrError;
  timeZones: TimeZonePayload[];
};
export const { useListTimeZoneNamesQuery, useLazyListTimeZoneNamesQuery } = injectedRtkApi;
