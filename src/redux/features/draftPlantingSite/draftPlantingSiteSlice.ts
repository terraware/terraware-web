import { createSlice } from '@reduxjs/toolkit';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import {
  requestCreateDraft,
  requestDeleteDraft,
  requestGetDraft,
  requestSearchDrafts,
  requestUpdateDraft,
} from './draftPlantingSiteThunks';

// created state
type CreatedState = Record<string, StatusT<number>>;
const initialCreatedState: CreatedState = {};

const draftPlantingSiteCreateSlice = createSlice({
  name: 'draftPlantingSiteCreateSlice',
  initialState: initialCreatedState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateDraft)(builder);
  },
});

// edit states (update/delete)
type EditState = Record<string, StatusT<boolean>>;
const initialEditState: EditState = {};

const draftPlantingSiteEditSlice = createSlice({
  name: 'draftPlantingSiteEditSlice',
  initialState: initialEditState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteDraft)(builder);
    buildReducers(requestUpdateDraft)(builder);
  },
});

// get state
type GetState = Record<string, StatusT<DraftPlantingSite>>;
const initialGetState: GetState = {};

const draftPlantingSiteGetSlice = createSlice({
  name: 'draftPlantingSiteGetSlice',
  initialState: initialGetState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetDraft, true)(builder);
  },
});

// search state
type SearchState = Record<string, StatusT<PlantingSiteSearchResult[]>>;
const initialSearchState: SearchState = {};

const draftPlantingSiteSearchSlice = createSlice({
  name: 'draftPlantingSiteSearchSlice',
  initialState: initialSearchState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSearchDrafts, true)(builder);
  },
});

export const draftPlantingSiteCreateReducer = draftPlantingSiteCreateSlice.reducer;
export const draftPlantingSiteEditReducer = draftPlantingSiteEditSlice.reducer;
export const draftPlantingSiteGetReducer = draftPlantingSiteGetSlice.reducer;
export const draftPlantingSiteSearchReducer = draftPlantingSiteSearchSlice.reducer;
