import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Snackbar, Type } from 'src/types/Snackbar';

type ClearSnackbarType = {
  type?: Type;
};

type SnackbarState = {
  snackbars: Record<Type, Snackbar | null>;
};

const initialState: SnackbarState = {
  snackbars: {
    page: null,
    toast: null,
  },
};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    sendSnackbar: (state, action: PayloadAction<Snackbar>) => {
      const snackbar = action.payload;
      state.snackbars[snackbar.type] = snackbar;
    },
    clearSnackbar: (state, action: PayloadAction<ClearSnackbarType>) => {
      const clearType = action.payload;
      if (!clearType.type) {
        state.snackbars = {
          page: null,
          toast: null,
        };
      } else {
        state.snackbars[clearType.type] = null;
      }
    },
  },
});

export const { sendSnackbar, clearSnackbar } = snackbarSlice.actions;

export const snackbarReducer = snackbarSlice.reducer;
