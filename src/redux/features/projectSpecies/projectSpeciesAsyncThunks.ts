import { createAsyncThunk } from '@reduxjs/toolkit';

import ProjectSpeciesService from 'src/services/ProjectSpeciesService';
import strings from 'src/strings';

export const requestSpeciesDeliverables = createAsyncThunk(
  'proejctSpecies/deliverables',
  async ({ projectIds }: { projectIds: number[] }, { rejectWithValue }) => {
    const response = await ProjectSpeciesService.searchSpeciesDeliverables(projectIds);

    if (response !== null) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
