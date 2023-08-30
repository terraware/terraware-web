import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import { Type } from 'src/types/Snackbar';

export const selectSnackbars = (state: RootState) => state.snackbar.snackbars;

export const selectSnackbar = (type: Type) => createSelector(selectSnackbars, (snackbars) => snackbars[type]);
