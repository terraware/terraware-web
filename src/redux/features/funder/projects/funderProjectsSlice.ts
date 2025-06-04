import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { FunderProjectDetails } from 'src/types/FunderProject';

import { requestGetFunderProject, requestPublishFunderProject } from './funderProjectsAsyncThunks';

const initialStateFunderProject: { [key: string]: StatusT<FunderProjectDetails> } = {};

export const funderProjectsSlice = createSlice({
  name: 'funderProjectSlice',
  initialState: initialStateFunderProject,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetFunderProject, true)(builder);
  },
});

const initialPublishFunderProjct: { [key: string]: StatusT<number> } = {};
export const publishFunderProjectSlice = createSlice({
  name: 'publishFunderProjectSlice',
  initialState: initialPublishFunderProjct,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPublishFunderProject)(builder);
  },
});

const funderProjectsReducers = {
  funderProject: funderProjectsSlice.reducer,
  publishFunderProject: publishFunderProjectSlice.reducer,
};

export default funderProjectsReducers;
