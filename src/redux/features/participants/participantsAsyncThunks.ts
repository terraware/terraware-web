import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ParticipantsService, { ParticipantData, ParticipantsData } from 'src/services/ParticipantsService';
import strings from 'src/strings';
import { Participant, ParticipantCreateRequest } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestCreateParticipant = createAsyncThunk(
  'participants/create',
  async (request: ParticipantCreateRequest, { rejectWithValue }) => {
    const response: Response2<number> = await ParticipantsService.create(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteParticipant = createAsyncThunk(
  'participants/delete',
  async (participantId: number, { rejectWithValue }) => {
    const response: Response2<number> = await ParticipantsService.deleteOne(participantId);

    if (response && response.requestSucceeded) {
      return participantId;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

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
    request: { locale?: string | null; search?: SearchNodePayload; sortOrder?: SearchSortOrder },
    { rejectWithValue }
  ) => {
    const { locale, search, sortOrder } = request;

    const response: Response2<ParticipantsData> = await ParticipantsService.list(locale, search, sortOrder);

    if (response && response.requestSucceeded) {
      return response.data?.participants;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestUpdateParticipant = createAsyncThunk(
  'participants/update',
  async (participant: Participant, { dispatch, rejectWithValue }) => {
    const response: Response2<number> = await ParticipantsService.update(participant);

    if (response && response.requestSucceeded) {
      dispatch(requestGetParticipant(participant.id));
      return participant.id;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
