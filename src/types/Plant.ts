export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type Plant = {
  featureId?: number;
  layerId?: number;
  coordinates?: Coordinate;
  notes?: string;
  enteredTime?: string;
  speciesId?: number;
};

export type PlantSearchOptions = {
  speciesName?: string;
  minEnteredTime?: string;
  maxEnteredTime?: string;
  notes?: string;
};

export type PlantsByLayerId = Map<number, Plant[]>;

export type PlantSummary = {
  speciesId: number;
  numPlants: number;
};

export type PlantSummaries = {
  lastWeek: PlantSummary[] | null;
  thisWeek: PlantSummary[] | null;
};

export type PlantSummariesByLayerId = Map<number, PlantSummaries>;

export type PlantPhoto = {
  featureId: number;
  imgSrc: string | null;
};

export enum PlantRequestError {
  LayerIdNotFound = 'SERVER_RETURNED_404_LAYER_ID_NOT_FOUND',
  FeatureIdNotFound = 'SERVER_RETURNED_404_FEATURE_ID_NOT_FOUND',
  NoPhotosFound = 'NO_PHOTOS_ASSOCIATED_WITH_FEATURE_ID',
  // Server returned any other error (3xx, 4xx, 5xxx), or server did not respond, or there was an error
  // setting up the request. In other words, there was a developer error or server outage.
  RequestFailed = 'AN_UNRECOVERABLE_ERROR_OCCURRED',
}

export type PlantErrorByLayerId = Map<number, PlantRequestError>;
