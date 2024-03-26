import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantProjectService, {
  ParticipantProjectData,
  ParticipantProjectSearchData,
} from 'src/services/ParticipantProjectService';
import strings from 'src/strings';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestGetParticipantProject = createAsyncThunk(
  'participantProjects/get-one',
  async (participantProjectId: number, { rejectWithValue }) => {
    const response: Response2<ParticipantProjectData> = await ParticipantProjectService.get(participantProjectId);

    if (response && response.requestSucceeded) {
      return response.data?.project;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export type ListRequest = {
  locale?: string | null;
  search?: SearchNodePayload;
  sortOrder?: SearchSortOrder;
};

export const requestListParticipantProjects = createAsyncThunk(
  'participantProjects/list',
  async ({ locale, search, sortOrder }: ListRequest, { rejectWithValue }) => {
    const response: Response2<ParticipantProjectSearchData> = await ParticipantProjectService.list(
      locale,
      search,
      sortOrder
    );

    if (response && response.requestSucceeded) {
      return response.data?.projects;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateParticipantProject = createAsyncThunk(
  'participantProjects/update',
  async (participantProject: ParticipantProject, { rejectWithValue, dispatch }) => {
    const response: Response2<number> = await ParticipantProjectService.update(participantProject);

    if (response && response.requestSucceeded && response.data) {
      dispatch(requestGetParticipantProject(response.data));
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
