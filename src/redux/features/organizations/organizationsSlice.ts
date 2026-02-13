import { createSlice } from '@reduxjs/toolkit';

import { OrganizationFeaturesData } from 'src/services/OrganizationService';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestOrganizationFeatures } from './organizationsAsyncThunks';

// Define the initial state
const initialStateFeatures: { [key: string]: StatusT<OrganizationFeaturesData> } = {};

export const featuresSlice = createSlice({
  name: 'featuresSlice',
  initialState: initialStateFeatures,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationFeatures)(builder);
  },
});

const organizationsReducers = {
  features: featuresSlice.reducer,
};

export default organizationsReducers;
