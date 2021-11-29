export type Species = {
  id: number;
  name: string;
};

export type SpeciesById = Map<number, Species>;

export enum SpeciesRequestError {
  ExistentSpecies = 'SERVER_RETURNED_409_EXISTENT_SPECIES',
  // Server returned any other error (3xx, 4xx, 5xxx), or server did not respond, or there was an error
  // setting up the request. In other words, there was a developer error or server outage.
  RequestFailed = 'AN_UNRECOVERABLE_ERROR_OCCURRED',
}
