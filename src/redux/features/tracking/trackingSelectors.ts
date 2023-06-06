import { RootState } from 'src/redux/rootReducer';
import { createSelector } from '@reduxjs/toolkit';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;
