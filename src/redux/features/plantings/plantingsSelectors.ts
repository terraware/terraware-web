import { createSelector } from '@reduxjs/toolkit';

import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { RootState } from 'src/redux/rootReducer';

export type PlantingProgress = {
  plantingCompleted: boolean;
  projectName: string;
  siteId: number;
  siteName: string;
  stratumId: number;
  stratumName: string;
  substratumId: number;
  substratumName: string;
  targetPlantingDensity: number;
  totalPlants: number;
  totalSeedlingsSent: number;
};

export const selectStrataHaveStatistics = createSelector(
  [
    (state: RootState, orgId: number, stratumIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      state,
    (state: RootState, orgId: number, stratumIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      orgId,
    (state: RootState, orgId: number, stratumIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      stratumIdsBySiteId,
    (state: RootState, orgId: number, stratumIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      defaultTimeZoneId,
  ],
  (state, orgId, stratumIdsBySiteId, defaultTimeZoneId) => {
    if (stratumIdsBySiteId && defaultTimeZoneId) {
      const strataHaveStatistics = Object.keys(stratumIdsBySiteId).some((siteId) => {
        const siteIdSelected = Number(siteId);
        const latestObservations = selectLatestObservation(state, siteIdSelected, orgId, defaultTimeZoneId);
        return Array.from(stratumIdsBySiteId[siteIdSelected]).some((stratumId) => {
          return latestObservations?.strata.some(
            (stratum) =>
              stratum.stratumId === stratumId &&
              stratum.estimatedPlants !== null &&
              stratum.estimatedPlants !== undefined
          );
        });
      });

      return strataHaveStatistics;
    }
  }
);
