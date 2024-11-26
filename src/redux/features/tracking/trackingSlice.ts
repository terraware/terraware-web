import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { PlantingSiteZone } from 'src/types/PlantingSite';
import { PlantingSite, PlantingSiteReportedPlants, PlantingSiteSearchResult } from 'src/types/Tracking';

import { MonitoringPlotsResponse, requestMonitoringPlots } from './trackingAsyncThunks';

// all sites data
type SitesData = {
  error?: string;
  plantingSites?: PlantingSite[];
};

// single planting site
type SiteData = {
  error?: string;
  locale?: string | null;
  plantingSite?: PlantingSite;
};

// Define the initial state
const initialState: SitesData = {};

export const trackingSlice = createSlice({
  name: 'trackingSlice',
  initialState,
  reducers: {
    setPlantingSitesAction: (state, action: PayloadAction<SitesData>) => {
      const data: SitesData = action.payload;
      state.error = data.error;
      state.plantingSites = data.plantingSites;
    },
    setPlantingSiteAction: (state, action: PayloadAction<SiteData>) => {
      const data: SiteData = action.payload;
      const { error, locale, plantingSite } = data;
      state.error = error;
      if (plantingSite) {
        // update state with planting site, resort with new information
        state.plantingSites = [
          ...(state.plantingSites ?? []).filter((site) => site.id !== plantingSite.id),
          plantingSite,
        ].sort((a, b) => a.name.localeCompare(b.name, locale || undefined));
      }
    },
  },
});

export const { setPlantingSiteAction, setPlantingSitesAction } = trackingSlice.actions;

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

// Planting Site Population Data Slice
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

// Planting Site Reported Plants Slice
type SiteReportedPlantsData = {
  error?: string;
  site?: PlantingSiteReportedPlants;
};

type SiteReportedPlantsPayload = {
  plantingSiteId: number;
  data: SiteReportedPlantsData;
};

const initialSiteReportedPlantsState: Record<number, SiteReportedPlantsData> = {};

export const siteReportedPlantsSlice = createSlice({
  name: 'siteReportedPlantsSlice',
  initialState: initialSiteReportedPlantsState,
  reducers: {
    setSiteReportedPlantsAction: (state, action: PayloadAction<SiteReportedPlantsPayload>) => {
      const payload: SiteReportedPlantsPayload = action.payload;
      state[payload.plantingSiteId] = payload.data;
    },
  },
});

export const { setSiteReportedPlantsAction } = siteReportedPlantsSlice.actions;

// Monitoring plots

type MonitoringPlotsState = Record<string, StatusT<MonitoringPlotsResponse>>;

const initialMonitoringPlotsState: MonitoringPlotsState = {};

const monitoringPlotsSlice = createSlice({
  name: 'monitoringPlots',
  initialState: initialMonitoringPlotsState,
  reducers: {},
  extraReducers: buildReducers<MonitoringPlotsResponse>(requestMonitoringPlots),
});

const trackingReducers = {
  tracking: trackingSlice.reducer,
  plantingSitesSearchResults: plantingSitesSearchResultsSlice.reducer,
  sitePopulation: sitePopulationSlice.reducer,
  siteReportedPlantsResults: siteReportedPlantsSlice.reducer,
  monitoringPlots: monitoringPlotsSlice.reducer,
};

export default trackingReducers;
