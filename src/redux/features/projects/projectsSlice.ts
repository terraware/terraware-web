import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  },
});

export const { setProjectsAction } = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;
