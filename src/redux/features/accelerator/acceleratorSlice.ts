import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { AcceleratorOrg } from 'src/types/Accelerator';

import { requestAcceleratorOrgs } from './acceleratorAsyncThunks';

/**
 * Accelerator orgs list
 */
const initialStateAcceleratorOrgs: Record<string, StatusT<AcceleratorOrg[]>> = {};

export const acceleratorOrgsSlice = createSlice({
  name: 'acceleratorOrgsSlice',
  initialState: initialStateAcceleratorOrgs,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAcceleratorOrgs)(builder);
  },
});

export const acceleratorOrgsReducer = acceleratorOrgsSlice.reducer;
