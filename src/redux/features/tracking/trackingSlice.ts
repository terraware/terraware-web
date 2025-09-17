import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { PlantingSiteZone } from 'src/types/PlantingSite';
import {
  PlantingSite,
  PlantingSiteHistory,
  PlantingSiteReportedPlants,
  PlantingSiteSearchResult,
  PlotT0Data,
} from 'src/types/Tracking';

import { MonitoringPlotsResponse, requestMonitoringPlots } from './trackingAsyncThunks';
import {
  PlotsWithObservationsSearchResult,
  requestAssignT0SiteData,
  requestGetPlantingSiteHistory,
  requestListPlantingSiteHistories,
  requestListPlantingSites,
  requestOnePlantingSite,
  requestOrganizationReportedPlants,
  requestPermanentPlotsWithObservations,
  requestPlantingSiteReportedPlants,
  requestPlantingSiteT0,
} from './trackingThunks';

// all sites data
type SitesData = {
  error?: string;
  plantingSites?: PlantingSite[];
  organizationId?: number;
};

// single planting site
type SiteData = {
  error?: string;
  locale?: string | null;
  plantingSite?: PlantingSite;
};

// Define the initial state
const initialState: { [organizationId: string]: StatusT<SitesData> } & SitesData = {};

export const trackingSlice = createSlice({
  name: 'trackingSlice',
  initialState,
  reducers: {
    setPlantingSitesAction: (state, action: PayloadAction<SitesData>) => {
      const data: SitesData = action.payload;
      state.error = data.error;
      state.plantingSites = data.plantingSites;
      state.organizationId = data.organizationId;
      if (data.organizationId) {
        state[data.organizationId.toString()] = {
          status: 'success',
          data,
        };
      }
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

const initialStatePlantingSiteList: { [key: string]: StatusT<PlantingSite[]> } = {};
export const plantingSiteListSlice = createSlice({
  name: 'plantingSiteListSlice',
  initialState: initialStatePlantingSiteList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListPlantingSites)(builder);
  },
});

const initialStatePlantingSite: { [key: string]: StatusT<PlantingSite> } = {};
export const plantingSiteSlice = createSlice({
  name: 'plantingSiteSlice',
  initialState: initialStatePlantingSite,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOnePlantingSite)(builder);
  },
});

const initialStatePlantingSiteHistory: { [key: string]: StatusT<PlantingSiteHistory> } = {};

export const plantingSiteHistorySlice = createSlice({
  name: 'plantingSiteHistorySlice',
  initialState: initialStatePlantingSiteHistory,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetPlantingSiteHistory)(builder);
  },
});

const initialStatePlantingSiteHistories: { [key: string]: StatusT<PlantingSiteHistory[]> } = {};

export const plantingSiteHistoriesSlice = createSlice({
  name: 'plantingSiteHistoriesSlice',
  initialState: initialStatePlantingSiteHistories,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListPlantingSiteHistories)(builder);
  },
});

const initialStatePlantingSiteReportedPlants: { [key: string]: StatusT<PlantingSiteReportedPlants> } = {};

export const plantingSiteReportedPlantsSlice = createSlice({
  name: 'plantingSiteReportedPlantsSlice',
  initialState: initialStatePlantingSiteReportedPlants,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteReportedPlants)(builder);
  },
});

const initialStateOrganizationReportedPlants: { [key: string]: StatusT<PlantingSiteReportedPlants[]> } = {};
export const organizationReportedPlantsSlice = createSlice({
  name: 'organizationReportedPlantsSlice',
  initialState: initialStateOrganizationReportedPlants,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationReportedPlants)(builder);
  },
});

const initialPlantingSiteT0: { [key: string]: StatusT<PlotT0Data[]> } = {};

export const plantingSiteT0Slice = createSlice({
  name: 'plantingSiteT0Slice',
  initialState: initialPlantingSiteT0,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteT0)(builder);
  },
});

const initialPlotsWithObservationsState: { [key: string]: StatusT<PlotsWithObservationsSearchResult[]> } = {};

export const plotsWithObservations = createSlice({
  name: 'plotsWithObservationsSlice',
  initialState: initialPlotsWithObservationsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPermanentPlotsWithObservations, true)(builder);
  },
});

const initialAssignT0SiteDataState: { [key: string]: StatusT<number> } = {};

export const assignT0SiteData = createSlice({
  name: 'assignT0SiteDataSlice',
  initialState: initialAssignT0SiteDataState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAssignT0SiteData)(builder);
  },
});

const trackingReducers = {
  tracking: trackingSlice.reducer,
  plantingSitesSearchResults: plantingSitesSearchResultsSlice.reducer,
  sitePopulation: sitePopulationSlice.reducer,
  siteReportedPlantsResults: siteReportedPlantsSlice.reducer,
  monitoringPlots: monitoringPlotsSlice.reducer,
  plantingSite: plantingSiteSlice.reducer,
  plantingSiteList: plantingSiteListSlice.reducer,
  plantingSiteHistory: plantingSiteHistorySlice.reducer,
  plantingSiteHistories: plantingSiteHistoriesSlice.reducer,
  plantingSiteReportedPlants: plantingSiteReportedPlantsSlice.reducer,
  organizationReportedPlants: organizationReportedPlantsSlice.reducer,
  plantingSiteT0: plantingSiteT0Slice.reducer,
  plotsWithObservations: plotsWithObservations.reducer,
  assignT0SiteData: assignT0SiteData.reducer,
};

export default trackingReducers;
