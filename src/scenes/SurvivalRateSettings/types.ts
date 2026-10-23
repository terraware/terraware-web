type PlotT0Observation = {
  observation_startDate: string;
  observation_completedTime: string;
  observation_id: string;
  isPermanent: string;
};

export type PlotsWithObservationsSearchResult = {
  id: number;
  name: string;
  substratum_name: string;
  substratum_stratum_name: string;
  substratum_stratum_id: string;
  observationPlots: PlotT0Observation[];
  permanentIndex?: string;
};
