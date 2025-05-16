import { createAsyncThunk } from '@reduxjs/toolkit';

import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Species } from 'src/types/Species';

export const requestGetOneSpecies = createAsyncThunk(
  'species/get-one',
  async (request: { organizationId: number; speciesId: number }, { rejectWithValue }) => {
    const { organizationId, speciesId } = request;

    const response = await SpeciesService.getSpecies(speciesId, organizationId);

    if (response && response.requestSucceeded && response.species) {
      return response.species;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListSpecies = createAsyncThunk(
  'species/list',
  async (organizationId: number, { rejectWithValue }) => {
    const response = await SpeciesService.getAllSpecies(organizationId, false);

    if (response && response.requestSucceeded && response.data) {
      return response.data.species;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListInUseSpecies = createAsyncThunk(
  'species/listInUse',
  async (organizationId: number, { rejectWithValue }) => {
    const response = await SpeciesService.getAllSpecies(organizationId, true);

    if (response && response.requestSucceeded && response.data) {
      return response.data.species;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateSpecies = createAsyncThunk(
  'species/update',
  async (request: { organizationId: number; species: Species }, { rejectWithValue }) => {
    const { organizationId, species } = request;

    const response = await SpeciesService.updateSpecies(species, organizationId);

    if (response && response.requestSucceeded) {
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
