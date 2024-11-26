import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { AcceleratorOrg } from 'src/types/Accelerator';

import { requestAcceleratorOrgs, requestAssignTerraformationContact } from './acceleratorAsyncThunks';

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

/**
 * Assign terraformation contact
 */
const initialStateAssignTerraformationContact: Record<string, StatusT<Response>> = {};

export const assignTerraformationContactSlice = createSlice({
  name: 'assignTerraformationContactSlice',
  initialState: initialStateAssignTerraformationContact,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAssignTerraformationContact)(builder);
  },
});

const acceleratorReducers = {
  acceleratorOrgs: acceleratorOrgsSlice.reducer,
  assignTerraformationContact: assignTerraformationContactSlice.reducer,
};

export default acceleratorReducers;
