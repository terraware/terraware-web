import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { FunderProjectDetails } from 'src/types/FunderProject';

import { requestGetFunderProject } from './funderProjectsAsyncThunks';

const initialStateFunderProject: { [key: string]: StatusT<FunderProjectDetails> } = {};

export const funderProjectsSlice = createSlice({
  name: 'funderProjectSlice',
  initialState: initialStateFunderProject,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetFunderProject, true)(builder);
  },
});

const funderProjectsReducers = {
  funderProject: funderProjectsSlice.reducer,
};

export default funderProjectsReducers;
