import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  AcceleratorProjectForSpecies,
  AcceleratorProjectSpecies,
  SpeciesForAcceleratorProject,
} from 'src/types/AcceleratorProjectSpecies';

import {
  requestAddManyAcceleratorProjectSpecies,
  requestCreateAcceleratorProjectSpecies,
  requestDeleteManyAcceleratorProjectSpecies,
  requestGetAcceleratorProjectSpecies,
  requestGetProjectsForSpecies,
  requestListAcceleratorProjectSpecies,
  requestUpdateAcceleratorProjectSpecies,
} from './acceleratorProjectSpeciesAsyncThunks';

/**
 * Create Accelerator Projects Species
 */
const initialStateAcceleratorProjectSpeciesCreate: { [key: string]: StatusT<AcceleratorProjectSpecies> } = {};

export const acceleratorProjectSpeciesCreateSlice = createSlice({
  name: 'acceleratorProjectSpeciesCreateSlice',
  initialState: initialStateAcceleratorProjectSpeciesCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateAcceleratorProjectSpecies)(builder);
  },
});

/**
 * Remove Accelerator Project Species
 */
const initialStateAcceleratorProjectDeleteMany: { [key: string]: StatusT<boolean> } = {};

export const acceleratorProjectSpeciesDeleteManySlice = createSlice({
  name: 'acceleratorProjectSpeciesDeleteManySlice',
  initialState: initialStateAcceleratorProjectDeleteMany,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteManyAcceleratorProjectSpecies)(builder);
  },
});

/**
 * Add Accelerator Project Species
 */
const initialStateAcceleratorProjectAddMany: { [key: string]: StatusT<boolean> } = {};

export const acceleratorProjectSpeciesAddManySlice = createSlice({
  name: 'acceleratorProjectSpeciesAddManySlice',
  initialState: initialStateAcceleratorProjectAddMany,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAddManyAcceleratorProjectSpecies)(builder);
  },
});

/**
 * Get Accelerator Project Species
 */
const initialStateAcceleratorProjectGet: { [key: string]: StatusT<AcceleratorProjectSpecies> } = {};

export const acceleratorProjectSpeciesGetSlice = createSlice({
  name: 'acceleratorProjectSpeciesGetSlice',
  initialState: initialStateAcceleratorProjectGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetAcceleratorProjectSpecies, true)(builder);
  },
});

/**
 * Get Projects for Species
 */
const initialStateAcceleratorProjectsForSpeciesGet: { [key: string]: StatusT<AcceleratorProjectForSpecies[]> } = {};

export const acceleratorProjectsForSpeciesGetSlice = createSlice({
  name: 'acceleratorProjectsForSpeciesGetSlice',
  initialState: initialStateAcceleratorProjectsForSpeciesGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetProjectsForSpecies)(builder);
  },
});

/**
 * List Accelerator Project Species
 */
const initialStateAcceleratorProjectsList: { [key: string]: StatusT<SpeciesForAcceleratorProject[]> } = {};

export const acceleratorProjectSpeciesListSlice = createSlice({
  name: 'acceleratorProjectSpeciesListSlice',
  initialState: initialStateAcceleratorProjectsList,
  reducers: {},
  extraReducers: (builder) => {
    // Project ID used as arg
    buildReducers(requestListAcceleratorProjectSpecies, true)(builder);
  },
});

/**
 * Update Accelerator Project Species
 */
const initialStateAcceleratorProjectUpdate: { [key: string]: StatusT<boolean> } = {};

export const acceleratorProjectSpeciesUpdateSlice = createSlice({
  name: 'acceleratorProjectSpeciesUpdateSlice',
  initialState: initialStateAcceleratorProjectUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateAcceleratorProjectSpecies, true)(builder);
  },
});

const acceleratorProjectSpeciesReducers = {
  acceleratorProjectSpeciesCreate: acceleratorProjectSpeciesCreateSlice.reducer,
  acceleratorProjectSpeciesDeleteMany: acceleratorProjectSpeciesDeleteManySlice.reducer,
  acceleratorProjectSpeciesAddMany: acceleratorProjectSpeciesAddManySlice.reducer,
  acceleratorProjectSpeciesGet: acceleratorProjectSpeciesGetSlice.reducer,
  acceleratorProjectSpeciesList: acceleratorProjectSpeciesListSlice.reducer,
  acceleratorProjectSpeciesUpdate: acceleratorProjectSpeciesUpdateSlice.reducer,
  acceleratorProjectsForSpeciesGet: acceleratorProjectsForSpeciesGetSlice.reducer,
};

export default acceleratorProjectSpeciesReducers;
