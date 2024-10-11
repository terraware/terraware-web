import { createAsyncThunk } from '@reduxjs/toolkit';

import EventService, { CreateModuleEventResponsePayload, ListEventsRequestParam } from 'src/services/EventService';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';
import { CreateModuleEventRequestPayload, UpdateModuleEventProjectsRequestPayload } from 'src/types/Event';

export const requestGetEvent = createAsyncThunk('events/get', async (eventId: number, { rejectWithValue }) => {
  const response = await EventService.get(eventId);

  if (response !== null && response.requestSucceeded && response?.data?.event !== undefined) {
    return response.data.event;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestListEvents = createAsyncThunk(
  'events/list',
  async (request: ListEventsRequestParam, { rejectWithValue }) => {
    const response = await EventService.list(request);

    if (response !== null && response.requestSucceeded && response?.data?.events !== undefined) {
      return response.data.events;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestCreateModuleEvent = createAsyncThunk(
  'events/create',
  async (request: { event: CreateModuleEventRequestPayload }, { rejectWithValue }) => {
    const response: Response2<CreateModuleEventResponsePayload> = await EventService.createEvent(request.event);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestEventProjectsUpdate = createAsyncThunk(
  'eventProjects/update',
  async (request: { payload: UpdateModuleEventProjectsRequestPayload & { eventId: number } }, { rejectWithValue }) => {
    const { eventId, ...rest } = request.payload;
    const response: Response2<CreateModuleEventResponsePayload> = await EventService.updateEventProjects(eventId, rest);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
