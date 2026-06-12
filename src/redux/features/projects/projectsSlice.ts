import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestProjectAssign, requestProjectDelete } from 'src/redux/features/projects/projectsAsyncThunks';
import { DeleteProjectResponsePayload } from 'src/services/ProjectsService';

type ProjectsResponsesUnion = DeleteProjectResponsePayload;
type ProjectsRequestsState = Record<string, StatusT<ProjectsResponsesUnion>>;

const initialProjectsRequestsState: ProjectsRequestsState = {};

export const projectsRequestsSlice = createSlice({
  name: 'projectsRequestsSlice',
  initialState: initialProjectsRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<ProjectsRequestsState>) => {
    buildReducers(requestProjectDelete)(builder);
    buildReducers(requestProjectAssign)(builder);
  },
});

const projectsReducers = {
  projectsRequests: projectsRequestsSlice.reducer,
};

export default projectsReducers;
