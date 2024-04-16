import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response, Response2 } from 'src/services/HttpService';
import ParticipantsService, {
  ParticipantData,
  ParticipantDataWithCurrentModule,
} from 'src/services/ParticipantsService';
import strings from 'src/strings';
import { ParticipantCreateRequest, ParticipantSearchResult, ParticipantUpdateRequest } from 'src/types/Participant';
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
    const response: Response2<ParticipantDataWithCurrentModule> = await ParticipantsService.get(participantId);

    if (response && response.requestSucceeded) {
      return response.data?.participant;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListParticipants = createAsyncThunk(
  'participants/list',
  async (request: { search?: SearchNodePayload; sortOrder?: SearchSortOrder }, { rejectWithValue }) => {
    const { search, sortOrder } = request;

    const response: ParticipantSearchResult[] | null = await ParticipantsService.list(search, sortOrder);

    if (response) {
      return response;
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
      dispatch(requestGetParticipant(participantId));
      return true;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
