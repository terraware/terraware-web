import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpeciesProjectsSearchResponse } from 'src/services/SpeciesService';

type SpeciesId = number;

type Payload = {
  projects: SpeciesProjectsSearchResponse['projects'];
  speciesId: SpeciesId;
};

// Define the initial state
const initialState: Record<SpeciesId, SpeciesProjectsSearchResponse['projects']> = {};

export const speciesProjectsSlice = createSlice({
  name: 'speciesProjectsSlice',
  initialState,
  reducers: {
    setSpeciesProjectsAction: (state, action: PayloadAction<Payload>) => {
      if (action.payload.projects) {
        state[action.payload.speciesId] = action.payload.projects;
      }
    },
  },
});

export const { setSpeciesProjectsAction } = speciesProjectsSlice.actions;

export const speciesProjectsReducer = speciesProjectsSlice.reducer;
