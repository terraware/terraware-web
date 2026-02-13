import { createSlice } from '@reduxjs/toolkit';

import { OrganizationFeaturesData } from 'src/services/OrganizationService';
import { InternalTag } from 'src/types/InternalTag';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestOrganizationFeatures,
  requestOrganizationInternalTags,
  requestUpdateOrganizationInternalTags,
} from './organizationsAsyncThunks';

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

// Define the initial state
const initialStateInternalTags: { [key: string]: StatusT<InternalTag[]> } = {};

export const internalTagsSlice = createSlice({
  name: 'internalTagsSlice',
  initialState: initialStateInternalTags,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationInternalTags)(builder);
  },
});

const initialStateInternalTagsUpdateSlice: { [key: string]: StatusT<number> } = {};

export const internalTagsUpdateSlice = createSlice({
  name: 'internalTagsUpdateSlice',
  initialState: initialStateInternalTagsUpdateSlice,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateOrganizationInternalTags, true)(builder);
  },
});

const organizationsReducers = {
  features: featuresSlice.reducer,
  internalTags: internalTagsSlice.reducer,
  internalTagsUpdate: internalTagsUpdateSlice.reducer,
};

export default organizationsReducers;
