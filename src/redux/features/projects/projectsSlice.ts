import { ActionReducerMapBuilder, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestProjectAssign,
  requestProjectDelete,
  requestProjectInternalUsersUpdate,
  requestProjectUpdate,
} from 'src/redux/features/projects/projectsAsyncThunks';
import { UpdateProjectInternalUsersResponsePayload, UpdateProjectResponsePayload } from 'src/services/ProjectsService';
import { Project } from 'src/types/Project';

// Define a type for the slice state
type Data = {
  error?: string;
  projects?: Project[];
};

// Define the initial state
const initialState: Data = {};

export const projectsSlice = createSlice({
  name: 'projectsSlice',
  initialState,
  reducers: {
    setProjectsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.projects = data.projects;
    },
    setProjectAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      const payloadProjects = data.projects || [];
      state.error = data.error;
      state.projects = [
        // Filter out the newly fetched project from state, if it exists
        ...(state.projects || []).filter(
          (project) => !payloadProjects.map((_project) => _project.id).includes(project.id)
        ),
        ...payloadProjects,
      ];
    },
  },
});

export const { setProjectsAction, setProjectAction } = projectsSlice.actions;

type ProjectsResponsesUnion = UpdateProjectResponsePayload;
type ProjectsRequestsState = Record<string, StatusT<ProjectsResponsesUnion>>;

const initialProjectsRequestsState: ProjectsRequestsState = {};

export const projectsRequestsSlice = createSlice({
  name: 'projectsRequestsSlice',
  initialState: initialProjectsRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<ProjectsRequestsState>) => {
    buildReducers(requestProjectUpdate)(builder);
    buildReducers(requestProjectDelete)(builder);
    buildReducers(requestProjectAssign)(builder);
  },
});

/**
 * Project internal users
 */
type ProjectInternalUsersUpdateState = Record<string, StatusT<UpdateProjectInternalUsersResponsePayload>>;

const initialStateProjectInternalUsersUpdate: ProjectInternalUsersUpdateState = {};

export const projectInternalUsersUpdateSlice = createSlice({
  name: 'projectInternalUsersUpdateSlice',
  initialState: initialStateProjectInternalUsersUpdate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestProjectInternalUsersUpdate)(builder);
  },
});

const projectsReducers = {
  projects: projectsSlice.reducer,
  projectsRequests: projectsRequestsSlice.reducer,
  projectInternalUsersUpdate: projectInternalUsersUpdateSlice.reducer,
};

export default projectsReducers;
