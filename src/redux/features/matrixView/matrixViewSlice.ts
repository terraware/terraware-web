import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';

import { ProjectsWithVariablesSearchResult, requestGetProjectsWithVariables } from './matrixViewThunks';

const initialProjectsWithVariablesState: { [key: string]: StatusT<ProjectsWithVariablesSearchResult[]> } = {};

export const projectsWithVariablesSlice = createSlice({
  name: 'projectsWithVariablesSlice',
  initialState: initialProjectsWithVariablesState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetProjectsWithVariables, true)(builder);
  },
});

const gisReducers = {
  projectsWithVariablesRequest: projectsWithVariablesSlice.reducer,
};

export default gisReducers;
