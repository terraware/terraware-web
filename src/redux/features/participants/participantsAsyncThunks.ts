import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import ParticipantsService from 'src/services/ParticipantsService';
import { Response2 } from 'src/services/HttpService';

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
