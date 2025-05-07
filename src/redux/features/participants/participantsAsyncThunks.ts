import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response, Response2 } from 'src/services/HttpService';
import ParticipantsService, { ParticipantData } from 'src/services/ParticipantsService';
import strings from 'src/strings';
import { ParticipantCreateRequest, ParticipantUpdateRequest } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

export const requestCreateParticipant = createAsyncThunk(
  'participants/create',
  async (request: ParticipantCreateRequest, { rejectWithValue }) => {
    const response: Response2<ParticipantData> = await ParticipantsService.create(request);

    if (response && response.requestSucceeded) {
      return response.data?.participant;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeleteParticipant = createAsyncThunk(
  'participants/delete',
  async (participantId: number, { rejectWithValue }) => {
    const response: Response2<number> = await ParticipantsService.deleteOne(participantId);

    if (response && response.requestSucceeded) {
      return true;
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

export const requestUpdateParticipant = createAsyncThunk(
  'participants/update',
  async (
    {
      participantId,
      request,
    }: {
      participantId: number;
      request: ParticipantUpdateRequest;
    },
    { dispatch, rejectWithValue }
  ) => {
    const response: Response = await ParticipantsService.update(participantId, request);

    if (response && response.requestSucceeded) {
      void dispatch(requestGetParticipant(participantId));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
