import { createAsyncThunk } from '@reduxjs/toolkit';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import {
  CreateDraftPlantingSiteResponse,
  GetDraftPlantingSiteResponse,
  createDraftPlantingSite,
  deleteDraftPlantingSite,
  getDraftPlantingSite,
  updateDraftPlantingSite,
} from 'src/services/DraftPlantingSiteService';
import { DraftPlantingSite } from 'src/types/PlantingSite';

/**
 * Create a draft
 */
export const requestCreateDraft = createAsyncThunk(
  'requestCreateDraft',
  async (draft: DraftPlantingSite, { rejectWithValue }) => {
    const response: CreateDraftPlantingSiteResponse = await createDraftPlantingSite(draft);

    if (response.requestSucceeded) {
      return response.draftId;
    } else {
      return rejectWithValue(strings.GENERIC_ERROR);
    }
  }
);

/**
 * Get a draft
 */
export const requestGetDraft = createAsyncThunk('requestGetDraft', async (id: number, { rejectWithValue }) => {
  const response: GetDraftPlantingSiteResponse = await getDraftPlantingSite(id);

  if (response.requestSucceeded) {
    return response.site;
  } else {
    return rejectWithValue(strings.GENERIC_ERROR);
  }
});

/**
 * Delete a draft
 */
export const requestDeleteDraft = createAsyncThunk('requestDeleteDraft', async (id: number, { rejectWithValue }) => {
  const response: Response = await deleteDraftPlantingSite(id);

  if (response.requestSucceeded) {
    return true;
  } else {
    return rejectWithValue(strings.GENERIC_ERROR);
  }
});

/**
 * Update a draft
 */
export const requestUpdateDraft = createAsyncThunk(
  'requestUpdateDraft',
  async (draft: DraftPlantingSite, { rejectWithValue }) => {
    const response: Response = await updateDraftPlantingSite(draft);

    if (response.requestSucceeded) {
      return true;
    } else {
      return rejectWithValue(strings.GENERIC_ERROR);
    }
  }
);
