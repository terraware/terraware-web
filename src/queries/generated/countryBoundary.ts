import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBorder: build.query<GetBorderApiResponse, GetBorderApiArg>({
      query: (queryArg) => ({ url: `/api/v1/countries/${queryArg}/boundary` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetBorderApiResponse = /** status 200 OK */ GetCountryBorderResponsePayload;
export type GetBorderApiArg = string;
export type CrsProperties = {
  /** Name of the coordinate reference system. This must be in the form EPSG:nnnn where nnnn is the numeric identifier of a coordinate system in the EPSG dataset. The default is Longitude/Latitude EPSG:4326, which is the coordinate system for GeoJSON. */
  name: string;
};
export type Crs = {
  properties: CrsProperties;
  type: 'name';
};
export type GeometryBase = {
  crs?: Crs;
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';
};
export type MultiPolygon = {
  type: 'MultiPolygon';
} & GeometryBase & {
    coordinates: number[][][][];
    type: 'MultiPolygon';
  };
export type SuccessOrError = 'ok' | 'error';
export type GetCountryBorderResponsePayload = {
  border: MultiPolygon;
  status: SuccessOrError;
};
export const { useGetBorderQuery, useLazyGetBorderQuery } = injectedRtkApi;
