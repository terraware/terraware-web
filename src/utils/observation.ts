import {
  BiomassTreeSpeciesResultsPayload,
  ExistingBiomassMeasurementPayload,
  ObservationMonitoringPlotResultsPayload,
  ObservationResultsPayload,
  ObservationStratumResultsPayload,
} from 'src/queries/generated/observations';
import { ObservationSpeciesResults, ObservationSpeciesResultsPayload } from 'src/types/Observations';

export type BiomassTotals = {
  totalDead?: number;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  treeSpecies: BiomassTreeSpeciesResultsPayload[];
};

const EMPTY_BIOMASS_TOTALS: BiomassTotals = { treeSpecies: [] };

const summarizeBiomass = (measurements: ExistingBiomassMeasurementPayload[]): BiomassTotals => {
  if (measurements.length === 0) {
    return EMPTY_BIOMASS_TOTALS;
  }

  const speciesByKey = new Map<number | string, BiomassTreeSpeciesResultsPayload>();
  measurements.forEach((plotMeasurements) =>
    plotMeasurements.treeSpecies.forEach((species) => {
      const key = species.speciesId ?? species.speciesName;
      if (key === undefined) {
        return;
      }
      const merged = speciesByKey.get(key);
      speciesByKey.set(
        key,
        merged
          ? {
              ...merged,
              totalDead: merged.totalDead + species.totalDead,
              totalLive: merged.totalLive + species.totalLive,
            }
          : species
      );
    })
  );

  const totalLive = measurements.reduce((sum, plotMeasurements) => sum + plotMeasurements.totalLive, 0);
  const totalDead = measurements.reduce((sum, plotMeasurements) => sum + plotMeasurements.totalDead, 0);

  return {
    totalDead,
    totalLive,
    totalPlants: totalLive + totalDead,
    totalSpecies: speciesByKey.size,
    treeSpecies: [...speciesByKey.values()],
  };
};

const biomassMeasurementsOf = (strata: ObservationStratumResultsPayload[]) =>
  strata
    .flatMap((stratum) => stratum.substrata)
    .flatMap((substratum) => substratum.monitoringPlots)
    .map((plot) => plot.biomassMeasurements)
    .filter((plotMeasurements) => plotMeasurements !== undefined);

export const getBiomassPlotTotals = (plot: ObservationMonitoringPlotResultsPayload): BiomassTotals =>
  plot.biomassMeasurements ? summarizeBiomass([plot.biomassMeasurements]) : EMPTY_BIOMASS_TOTALS;

export const getBiomassStratumTotals = (stratum: ObservationStratumResultsPayload): BiomassTotals =>
  summarizeBiomass(biomassMeasurementsOf([stratum]));

export const getBiomassObservationTotals = (results: ObservationResultsPayload | undefined): BiomassTotals =>
  results ? summarizeBiomass(biomassMeasurementsOf(results.strata)) : EMPTY_BIOMASS_TOTALS;

export const isMonitoringPlotObserved = (plot: ObservationMonitoringPlotResultsPayload | undefined): boolean =>
  plot?.completedTime !== undefined && plot.status === 'Completed';

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
