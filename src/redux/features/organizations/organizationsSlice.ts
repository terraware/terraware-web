import { createSlice } from '@reduxjs/toolkit';

import { InternalTag } from 'src/types/InternalTag';
import { OrganizationWithInternalTags } from 'src/types/Organization';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestAddAcceleratorOrganization,
  requestListAllOrganizationsInternalTags,
  requestOrganizationInternalTags,
  requestRemoveAcceleratorOrganizations,
  requestUpdateOrganizationInternalTags,
} from './organizationsAsyncThunks';

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

const initialStateAddAcceleratorOrganizationSlice: { [key: string]: StatusT<number> } = {};

export const addAcceleratorOrganizationSlice = createSlice({
  name: 'addAcceleratorOrganizationSlice',
  initialState: initialStateAddAcceleratorOrganizationSlice,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAddAcceleratorOrganization, true)(builder);
  },
});

const initialStateRemoveAcceleratorOrganizationsSlice: { [key: string]: StatusT<number> } = {};

export const removeAcceleratorOrganizationsSlice = createSlice({
  name: 'removeAcceleratorOrganizationsSlice',
  initialState: initialStateRemoveAcceleratorOrganizationsSlice,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestRemoveAcceleratorOrganizations, true)(builder);
  },
});

const initialStateListAllOrganizationsInternalTagsSlice: { [key: string]: StatusT<OrganizationWithInternalTags[]> } =
  {};

export const listAllOrganizationsInternalTagsSlice = createSlice({
  name: 'listAllOrganizationsInternalTagsSlice',
  initialState: initialStateListAllOrganizationsInternalTagsSlice,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListAllOrganizationsInternalTags, true)(builder);
  },
});

const organizationsReducers = {
  internalTags: internalTagsSlice.reducer,
  internalTagsUpdate: internalTagsUpdateSlice.reducer,
  addAcceleratorOrganization: addAcceleratorOrganizationSlice.reducer,
  removeAcceleratorOrganizations: removeAcceleratorOrganizationsSlice.reducer,
  listAllOrganizationsInternalTags: listAllOrganizationsInternalTagsSlice.reducer,
};

export default organizationsReducers;
