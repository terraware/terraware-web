import { RootState } from 'src/redux/rootReducer';
import { createSelector } from '@reduxjs/toolkit';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;
export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;
