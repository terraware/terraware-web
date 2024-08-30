import { createAsyncThunk } from '@reduxjs/toolkit';

import EventService, { ListEventsRequestParam } from 'src/services/EventService';
import strings from 'src/strings';

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
