import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantsService, { ParticipantData } from 'src/services/ParticipantsService';
import strings from 'src/strings';

export const requestGetParticipant = createAsyncThunk(
  'participants/get-one',
  async (participantId: number, { rejectWithValue }) => {
    const response: Response2<ParticipantData> = await ParticipantsService.get(participantId);

    if (response && response.requestSucceeded) {
      return response.data?.participant;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
