export type Coordinate = {
  latitude: number;
  longitude: number;
};

type Plant = {
  featureId?: number,
  layerId: number,
  coordinates?: Coordinate,
  notes?: string,
  enteredTime?: string,
  speciesId?: number,
};

export type PlantSummary = {
  'speciesId': number;
  'count': number,
};

export type SearchOptions = {
  speciesName?: string;
  minEnteredTime?: string;
  maxEnteredTime?: string;
  notes?: string;
};

export default Plant;
