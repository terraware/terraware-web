import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from 'src/types/Project';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import { UpdateProjectResponsePayload } from 'src/services/ProjectsService';
import { requestProjectUpdate } from 'src/redux/features/projects/projectsAsyncThunks';

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
export const projectsReducer = projectsSlice.reducer;

// createAsyncThunk(s) reducer
type ProjectsResponsesUnion = UpdateProjectResponsePayload;
type ProjectsRequestsState = Record<string, StatusT<ProjectsResponsesUnion>>;

const initialProjectsRequestsState: ProjectsRequestsState = {};

export const projectsRequestsSlice = createSlice({
  name: 'projectsRequestsSlice',
  initialState: initialProjectsRequestsState,
  reducers: {},
  extraReducers: buildReducers<ProjectsResponsesUnion>(requestProjectUpdate),
});

export const projectsRequestsReducer = projectsRequestsSlice.reducer;
