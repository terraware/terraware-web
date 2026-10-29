import { FeatureCollection } from 'geojson';

import { MultiPolygon } from 'src/types/Tracking';

import { baseApi as api } from '../baseApi';

type GetGisFeaturesApiArg = {
  cqlFilter: string;
  propertyName: string;
  typeNames: string;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGisFeatures: build.query<FeatureCollection<MultiPolygon>, GetGisFeaturesApiArg>({
      query: ({ cqlFilter, propertyName, typeNames }) => ({
        // The server proxies arbitrary WFS parameters through to GeoServer, so the OpenAPI schema
        // doesn't describe them or the GeoJSON response and codegen can't produce a usable endpoint.
        url: '/api/v1/gis/wfs',
        params: {
          service: 'wfs',
          version: '2.0.0',
          request: 'GetFeature',
          typeNames,
          propertyName,
          outputFormat: 'application/json',
          srsName: 'EPSG:4326',
          cql_filter: cqlFilter,
        },
      }),
    }),
  }),
});

export const { useGetGisFeaturesQuery } = injectedRtkApi;
