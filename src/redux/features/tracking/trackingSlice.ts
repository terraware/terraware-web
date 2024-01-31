import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlantingSite, PlantingSiteReportedPlants, PlantingSiteSearchResult } from 'src/types/Tracking';
import { PlantingSiteZone } from 'src/types/PlantingSite';
import { MonitoringPlotsResponse, requestMonitoringPlots } from './trackingAsyncThunks';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';

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
        state.plantingSites = [
          ...(state.plantingSites ?? []).filter((site) => site.id !== plantingSite.id),
          plantingSite,
        ].sort((a, b) => a.name.localeCompare(b.name, locale || undefined));
      }
    },
  },
});

export const { setPlantingSiteAction, setPlantingSitesAction } = trackingSlice.actions;
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

export const sitePopulationReducer = sitePopulationSlice.reducer;

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

export const siteReportedPlantsReducer = siteReportedPlantsSlice.reducer;

// Monitoring plots

type MonitoringPlotsState = Record<string, StatusT<MonitoringPlotsResponse>>;

const initialMonitoringPlotsState: MonitoringPlotsState = {};

const monitoringPlotsSlice = createSlice({
  name: 'monitoringPlots',
  initialState: initialMonitoringPlotsState,
  reducers: {},
  extraReducers: buildReducers<MonitoringPlotsResponse>(requestMonitoringPlots),
});

export const monitoringPlotsReducer = monitoringPlotsSlice.reducer;
