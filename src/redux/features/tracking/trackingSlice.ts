import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlantingSite, PlantingSiteSearchResult } from 'src/types/Tracking';
import { PlantingSiteZone } from 'src/types/PlantingSite';

// Define a type for the slice state
type Data = {
  error?: string;
  plantingSites?: PlantingSite[];
};

// Define the initial state
const initialState: Data = {};

export const trackingSlice = createSlice({
  name: 'trackingSlice',
  initialState,
  reducers: {
    setPlantingSitesAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.plantingSites = data.plantingSites;
    },
  },
});

export const { setPlantingSitesAction } = trackingSlice.actions;
export const trackingReducer = trackingSlice.reducer;

// Define a type for the search slice state
type SearchData = {
  sites?: PlantingSiteSearchResult[];
};

// Define the initial state for search
const initialSearchState: SearchData = {};

export const plantingSitesSearchResultsSlice = createSlice({
  name: 'plantingSitesResultsSlice',
  initialState: initialSearchState,
  reducers: {
    setPlantingSitesSearchResultsAction: (state, action: PayloadAction<SearchData>) => {
      const data: SearchData = action.payload;
      state.sites = data.sites;
    },
  },
});

export const { setPlantingSitesSearchResultsAction } = plantingSitesSearchResultsSlice.actions;

export const plantingSitesSearchResultsReducer = plantingSitesSearchResultsSlice.reducer;

type SitePopulationData = {
  error?: string;
  zones?: PlantingSiteZone[];
};

const initialSitePopulationState: SitePopulationData = {};

export const sitePopulationSlice = createSlice({
  name: 'sitePopulationSlice',
  initialState: initialSitePopulationState,
  reducers: {
    setSitePopulationAction: (state, action: PayloadAction<SitePopulationData>) => {
      const data: SitePopulationData = action.payload;
      state.error = data.error;
      state.zones = data.zones;
    },
  },
});

export const { setSitePopulationAction } = sitePopulationSlice.actions;

export const sitePopulationReducer = sitePopulationSlice.reducer;
