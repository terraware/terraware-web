import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ValidatePlantingSiteResponsePayload } from 'src/types/PlantingSite';

import { createPlantingSite, validatePlantingSite } from './plantingSiteThunks';

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

const plantingSiteReducers = {
  plantingSiteCreate: createPlantingSiteSlice.reducer,
  plantingSiteValidate: validatePlantingSiteSlice.reducer,
};

export default plantingSiteReducers;
