import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers, setStatus } from 'src/redux/features/asyncUtils';
import { FunderProjectDetails } from 'src/types/FunderProject';

import { requestGetFunderProjects, requestPublishFunderProject } from './funderProjectsAsyncThunks';

const initialStateFunderProject: { [key: string]: StatusT<FunderProjectDetails> } = {};

export const funderProjectsSlice = createSlice({
  name: 'funderProjectSlice',
  initialState: initialStateFunderProject,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestGetFunderProjects.pending, setStatus('pending'))
      .addCase(requestGetFunderProjects.fulfilled, (state, action) => {
        setStatus('success')(state, action);

        action.payload?.forEach((project) => {
          state[project.projectId] = { status: 'success', data: project };
        });
      })
      .addCase(requestGetFunderProjects.rejected, setStatus('error'));
  },
});

const initialPublishFunderProject: { [key: string]: StatusT<number> } = {};
export const publishFunderProjectSlice = createSlice({
  name: 'publishFunderProjectSlice',
  initialState: initialPublishFunderProject,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPublishFunderProject)(builder);
  },
});

const funderProjectsReducers = {
  funderProjects: funderProjectsSlice.reducer,
  publishFunderProject: publishFunderProjectSlice.reducer,
};

export default funderProjectsReducers;
