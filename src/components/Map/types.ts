import { FeatureCollection } from 'geojson';

export type ReadOnlyBoundary = {
  featureCollection: FeatureCollection;
  id: string;
};
