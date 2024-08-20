import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { InternalTag } from 'src/types/InternalTag';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestOrganizationInternalTags, requestUpdateOrganizationInternalTags } from './organizationsAsyncThunks';

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
  internalTags: internalTagsSlice.reducer,
  internalTagsUpdate: internalTagsUpdateSlice.reducer,
};

export default organizationsReducers;
