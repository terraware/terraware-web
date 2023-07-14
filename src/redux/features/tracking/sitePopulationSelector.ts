import { RootState } from 'src/redux/rootReducer';
import { createSelector } from '@reduxjs/toolkit';

export const selectSitePopulation = (state: RootState) => state.sitePopulation?.zones;

export const selectSitePopulationError = (state: RootState) => state.sitePopulation?.error;

export const selectZonePopulationStats = createSelector(
  (state: RootState) => selectSitePopulation(state),
  (zones) => {
    const zoneStats: Record<number, { name: string; reportedPlants: number; reportedSpecies: number }> = {};
    zones?.forEach((zone) => {
      const speciesSet = new Set<string>();
      let numPlants = 0;
      zone.plantingSubzones?.forEach((subzone) =>
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
