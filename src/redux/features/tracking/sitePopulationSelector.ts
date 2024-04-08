import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { RootState } from 'src/redux/rootReducer';

export const selectSitePopulationZones = (state: RootState) => state.sitePopulation?.zones;

export const selectSitePopulationError = (state: RootState) => state.sitePopulation?.error;

export const selectZonePopulationStats = createSelector(
  (state: RootState) => selectSitePopulationZones(state),
  (zones) => {
    const zoneStats: Record<number, { name: string; reportedPlants: number; reportedSpecies: number }> = {};
    zones?.forEach((zone) => {
      const speciesSet = new Set<string>();
      let numPlants = 0;
      zone.plantingSubzones?.forEach(
        (subzone) =>
          subzone.populations?.forEach((population) => {
            const count = +population['totalPlants(raw)'];
            numPlants += isNaN(count) ? 0 : count;
            speciesSet.add(population.species_scientificName);
          })
      );
      zoneStats[+zone.id] = { name: zone.name, reportedPlants: numPlants, reportedSpecies: speciesSet.size };
    });
    return zoneStats;
  }
);

export const selectSubzonePopulations = createCachedSelector(
  (state: RootState, subzoneId: number) => selectSitePopulationZones(state),
  (state: RootState, subzoneId: number) => subzoneId,
  (zones, subzoneId) => {
    return zones
      ?.flatMap((zone) => zone.plantingSubzones)
      ?.filter((sz) => subzoneId === +sz.id)
      ?.flatMap((sz) => sz.populations)
      ?.filter((pop) => pop);
  }
)((state: RootState, subzoneId: number) => `subzone-${subzoneId}-populations`);

export const selectSubzoneSpeciesPopulations = createCachedSelector(
  (state: RootState, subzoneId: number) => selectSubzonePopulations(state, subzoneId),
  (populations) => {
    const species: Record<string, number> = {};
    populations?.forEach((pop) => {
      if (species[pop.species_scientificName]) {
        species[pop.species_scientificName] += +pop['totalPlants(raw)'];
      } else {
        species[pop.species_scientificName] = +pop['totalPlants(raw)'];
      }
    });
    return species;
  }
)((state: RootState, subzoneId: number) => `subzone-${subzoneId}-species-populations`);
