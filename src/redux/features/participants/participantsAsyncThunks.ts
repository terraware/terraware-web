import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantsService, { ParticipantData } from 'src/services/ParticipantsService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

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

export const requestListParticipants = createAsyncThunk(
  'participants/list',
  async (
    request: { locale?: string; search?: SearchNodePayload; sortOrder?: SearchSortOrder },
    { rejectWithValue }
  ) => {
    const { locale, search, sortOrder } = request;

    const response = await ParticipantsService.list(locale, search, sortOrder);

    if (response && response.status === 'ok') {
      return response.participants;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
