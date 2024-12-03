import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantProjectService, { ParticipantProjectData } from 'src/services/ParticipantProjectService';
import strings from 'src/strings';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestGetParticipantProject = createAsyncThunk(
  'participantProjects/get-one',
  async (participantProjectId: number, { rejectWithValue }) => {
    const response: Response2<ParticipantProjectData> = await ParticipantProjectService.get(participantProjectId);

    if (response && response.requestSucceeded) {
      return response.data?.details;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export type ListRequest = {
  locale?: string;
  search: SearchNodePayload;
  sortOrder: SearchSortOrder;
};

export const requestListParticipantProjects = createAsyncThunk(
  'participantProjects/list',
  async ({ locale, search, sortOrder }: ListRequest, { rejectWithValue }) => {
    const response = await ParticipantProjectService.list(locale, search, sortOrder);

    if (response && response.status === 'ok') {
      return response.details;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateParticipantProject = createAsyncThunk(
  'participantProjects/update',
  async (participantProject: ParticipantProject, { rejectWithValue }) => {
    const response: Response2<number> = await ParticipantProjectService.update(participantProject);

    if (response && response.requestSucceeded && response.data) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
