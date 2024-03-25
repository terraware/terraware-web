import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantProjectService, { ParticipantProjectData } from 'src/services/ParticipantProjectService';
import strings from 'src/strings';
import { ParticipantProject } from 'src/types/ParticipantProject';

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

export const requestUpdateParticipantProject = createAsyncThunk(
  'participantProjects/update',
  async (participantProject: ParticipantProject, { rejectWithValue }) => {
    const response: Response2<number> = await ParticipantProjectService.update(participantProject);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
