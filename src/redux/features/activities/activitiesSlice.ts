import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { ActivityMediaFile, ActivityPayload, AdminActivityPayload } from 'src/types/Activity';

import {
  requestAdminCreateActivity,
  requestAdminGetActivity,
  requestAdminListActivities,
  requestAdminUpdateActivity,
  requestCreateActivity,
  requestDeleteActivity,
  requestDeleteActivityMedia,
  requestGetActivity,
  requestGetActivityMedia,
  requestGetFileForToken,
  requestListActivities,
  requestUpdateActivity,
  requestUpdateActivityMedia,
  requestUploadActivityMedia,
} from './activitiesAsyncThunks';

/**
 * Activity create
 */
const initialStateActivityCreate: Record<string, StatusT<ActivityPayload>> = {};

export const activityCreateSlice = createSlice({
  name: 'activityCreateSlice',
  initialState: initialStateActivityCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateActivity)(builder);
  },
});

/**
 * Activity list
 */
const initialStateActivities: Record<string, StatusT<ActivityPayload[]>> = {};

export const activityListSlice = createSlice({
  name: 'activityListSlice',
  initialState: initialStateActivities,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListActivities)(builder);
  },
});

/**
 * Admin activity list
 */
const initialStateAdminActivities: Record<string, StatusT<AdminActivityPayload[]>> = {};

export const adminActivityListSlice = createSlice({
  name: 'adminActivityListSlice',
  initialState: initialStateAdminActivities,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAdminListActivities)(builder);
  },
});

/**
 * Admin activity get
 */
const initialStateAdminActivityGet: Record<string, StatusT<AdminActivityPayload>> = {};

export const adminActivityGetSlice = createSlice({
  name: 'adminActivityGetSlice',
  initialState: initialStateAdminActivityGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAdminGetActivity)(builder);
  },
});

/**
 * Admin activity update
 */
const initialStateAdminActivityUpdate: Record<string, StatusT<boolean>> = {};

export const adminActivityUpdateSlice = createSlice({
  name: 'adminActivityUpdateSlice',
  initialState: initialStateAdminActivityUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAdminUpdateActivity)(builder);
  },
});

/**
 * Admin activity create
 */
const initialStateAdminActivityCreate: Record<string, StatusT<AdminActivityPayload>> = {};

export const adminActivityCreateSlice = createSlice({
  name: 'adminActivityCreateSlice',
  initialState: initialStateAdminActivityCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAdminCreateActivity)(builder);
  },
});

/**
 * Activity get
 */
const initialStateActivityGet: Record<string, StatusT<ActivityPayload>> = {};

export const activityGetSlice = createSlice({
  name: 'activityGetSlice',
  initialState: initialStateActivityGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetActivity)(builder);
  },
});

/**
 * Activity update
 */
const initialStateActivityUpdate: Record<string, StatusT<boolean>> = {};

export const activityUpdateSlice = createSlice({
  name: 'activityUpdateSlice',
  initialState: initialStateActivityUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateActivity)(builder);
  },
});

/**
 * Activity delete
 */
const initialStateActivityDelete: Record<string, StatusT<boolean>> = {};

export const activityDeleteSlice = createSlice({
  name: 'activityDeleteSlice',
  initialState: initialStateActivityDelete,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteActivity)(builder);
  },
});

/**
 * Activity media upload
 */
const initialStateActivityMediaUpload: Record<string, StatusT<{ fileId: number }>> = {};

export const activityMediaUploadSlice = createSlice({
  name: 'activityMediaUploadSlice',
  initialState: initialStateActivityMediaUpload,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUploadActivityMedia)(builder);
  },
});

/**
 * Activity media get
 */
const initialStateActivityMediaGet: Record<string, StatusT<ActivityMediaFile>> = {};

export const activityMediaGetSlice = createSlice({
  name: 'activityMediaGetSlice',
  initialState: initialStateActivityMediaGet,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetActivityMedia)(builder);
  },
});

/**
 * Activity media update
 */
const initialStateActivityMediaUpdate: Record<string, StatusT<boolean>> = {};

export const activityMediaUpdateSlice = createSlice({
  name: 'activityMediaUpdateSlice',
  initialState: initialStateActivityMediaUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateActivityMedia)(builder);
  },
});

/**
 * Activity media delete
 */
const initialStateActivityMediaDelete: Record<string, StatusT<boolean>> = {};

export const activityMediaDeleteSlice = createSlice({
  name: 'activityMediaDeleteSlice',
  initialState: initialStateActivityMediaDelete,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeleteActivityMedia)(builder);
  },
});

/**
 * File access by token
 */
const initialStateFileForToken: Record<string, StatusT<any>> = {};

export const fileForTokenSlice = createSlice({
  name: 'fileForTokenSlice',
  initialState: initialStateFileForToken,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetFileForToken)(builder);
  },
});

const activityReducers = {
  activities: activityListSlice.reducer,
  activityCreate: activityCreateSlice.reducer,
  activityDelete: activityDeleteSlice.reducer,
  activityGet: activityGetSlice.reducer,
  activityUpdate: activityUpdateSlice.reducer,
  adminActivities: adminActivityListSlice.reducer,
  adminActivityCreate: adminActivityCreateSlice.reducer,
  adminActivityGet: adminActivityGetSlice.reducer,
  adminActivityUpdate: adminActivityUpdateSlice.reducer,
  activityMediaDelete: activityMediaDeleteSlice.reducer,
  activityMediaGet: activityMediaGetSlice.reducer,
  activityMediaUpdate: activityMediaUpdateSlice.reducer,
  activityMediaUpload: activityMediaUploadSlice.reducer,
  fileForToken: fileForTokenSlice.reducer,
};

export default activityReducers;
