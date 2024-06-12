import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ValidatePlantingSiteResponsePayload } from 'src/types/PlantingSite';

import { createPlantingSite, deletePlantingSite, updatePlantingSite, validatePlantingSite } from './plantingSiteThunks';

/**
 * Create Planting Site
 */
const initialCreatePlantingSiteState: { [key: string]: StatusT<number> } = {};

const createPlantingSiteSlice = createSlice({
  name: 'createPlantingSiteSlice',
  initialState: initialCreatePlantingSiteState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(createPlantingSite)(builder);
  },
});

/**
 * Validate Planting Site
 */
const initialValidatePlantingSiteState: { [key: string]: StatusT<ValidatePlantingSiteResponsePayload> } = {};

const validatePlantingSiteSlice = createSlice({
  name: 'validatePlantingSiteSlice',
  initialState: initialValidatePlantingSiteState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(validatePlantingSite)(builder);
  },
});

/**
 * Update Planting Site
 */
const initialUpdatePlantingSiteState: { [key: string]: StatusT<boolean> } = {};

const updatePlantingSiteSlice = createSlice({
  name: 'updatePlantingSiteSlice',
  initialState: initialUpdatePlantingSiteState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(updatePlantingSite)(builder);
  },
});

/**
 * Delete Planting Site
 */
const initialDeletePlantingSiteState: { [key: string]: StatusT<boolean> } = {};

const deletePlantingSiteSlice = createSlice({
  name: 'deletePlantingSiteSlice',
  initialState: initialDeletePlantingSiteState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(deletePlantingSite)(builder);
  },
});

const plantingSiteReducers = {
  plantingSiteCreate: createPlantingSiteSlice.reducer,
  plantingSiteValidate: validatePlantingSiteSlice.reducer,
  plantingSiteUpdate: updatePlantingSiteSlice.reducer,
  plantingSiteDelete: deletePlantingSiteSlice.reducer,
};

export default plantingSiteReducers;
