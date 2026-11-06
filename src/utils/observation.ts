import {
  ObservationMonitoringPlotResultsPayload,
  ObservationResultsPayload,
  ObservationStratumResultsPayload,
} from 'src/queries/generated/observations';
import { ObservationSpeciesResults, ObservationSpeciesResultsPayload } from 'src/types/Observations';

export type BiomassTotals = {
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
};

const EMPTY_BIOMASS_TOTALS: BiomassTotals = {};

export const getBiomassPlotTotals = (plot: ObservationMonitoringPlotResultsPayload): BiomassTotals => {
  const measurements = plot.biomassMeasurements;
  if (!measurements) {
    return EMPTY_BIOMASS_TOTALS;
  }
  return {
    totalLive: measurements.totalLive,
    totalPlants: measurements.totalLive + measurements.totalDead,
    totalSpecies: measurements.treeSpeciesCount,
  };
};

export const getBiomassStratumTotals = (stratum: ObservationStratumResultsPayload): BiomassTotals => {
  const measurements = stratum.substrata
    .flatMap((substratum) => substratum.monitoringPlots)
    .map((plot) => plot.biomassMeasurements)
    .filter((plotMeasurements) => plotMeasurements !== undefined);

  if (measurements.length === 0) {
    return EMPTY_BIOMASS_TOTALS;
  }

  const totalLive = measurements.reduce((sum, plotMeasurements) => sum + plotMeasurements.totalLive, 0);
  const totalDead = measurements.reduce((sum, plotMeasurements) => sum + plotMeasurements.totalDead, 0);
  const speciesKeys = new Set(
    measurements.flatMap((plotMeasurements) =>
      plotMeasurements.treeSpecies.map((species) => species.speciesId ?? species.speciesName)
    )
  );
  speciesKeys.delete(undefined);

  return { totalLive, totalPlants: totalLive + totalDead, totalSpecies: speciesKeys.size };
};

export const getObservationSpeciesLivePlantsCount = (
  species: ObservationSpeciesResults[] | ObservationSpeciesResultsPayload[] | undefined
): number | undefined => {
  return species && species.length > 0 ? species.reduce((sum, s) => sum + (s.totalLive || 0), 0) : undefined;
};

export const getObservationSpeciesDeadPlantsCount = (
  species: ObservationSpeciesResults[] | ObservationSpeciesResultsPayload[] | undefined
): number | undefined => {
  return species && species.length > 0 ? species?.reduce((sum, s) => sum + (s.totalDead || 0), 0) : undefined;
};

export const hasPendingResults = (results: ObservationResultsPayload | undefined): boolean =>
  !!results &&
  (results.pending ||
    results.strata.some(
      (stratum) =>
        stratum.pending ||
        stratum.substrata.some(
          (substratum) => substratum.pending || substratum.monitoringPlots.some((plot) => plot.pending)
        )
    ));
