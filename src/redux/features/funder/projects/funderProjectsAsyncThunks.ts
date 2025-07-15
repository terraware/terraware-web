import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import FunderProjectService, {
  FunderProjectData,
  PublishedProjectData,
} from 'src/services/funder/FunderProjectService';
import strings from 'src/strings';
import { FunderProjectDetails } from 'src/types/FunderProject';

export const requestListPublishedProjects = createAsyncThunk('funderProjects/list', async (_, { rejectWithValue }) => {
  const response: Response2<PublishedProjectData> = await FunderProjectService.getAll();

  if (response && response.requestSucceeded) {
    return response.data?.projects;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestGetFunderProjects = createAsyncThunk(
  'funderProjects/get',
  async (projectIds: number[], { rejectWithValue }) => {
    const response: Response2<FunderProjectData> = await FunderProjectService.get(projectIds);

    if (response && response.requestSucceeded) {
      return response.data?.projects;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestPublishFunderProject = createAsyncThunk(
  'funderProjects/publish',
  async (funderProjectDetails: FunderProjectDetails, { rejectWithValue }) => {
    const response = await FunderProjectService.publish(funderProjectDetails);

    if (response && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
