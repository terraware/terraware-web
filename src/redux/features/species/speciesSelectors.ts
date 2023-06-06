import { RootState } from 'src/redux/rootReducer';
import { createSelector } from '@reduxjs/toolkit';

export const selectSpecies = (state: RootState) => state.species?.species;
export const selectSpeciesError = (state: RootState) => state.species?.error;
