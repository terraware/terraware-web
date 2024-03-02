import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantsService from 'src/services/ParticipantsService';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';

export const requestParticipantsList = createAsyncThunk(
  'participants/list',
  async (request: undefined, { rejectWithValue }) => {
    const response: Response2<Participant[]> = await ParticipantsService.getParticipants();

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
