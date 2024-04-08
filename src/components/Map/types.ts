import { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';

export type ReadOnlyBoundary = {
  featureCollection: FeatureCollection;
  id: string;
};

export type GeometryFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties>;
