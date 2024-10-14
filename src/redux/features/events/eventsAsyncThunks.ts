import { createAsyncThunk } from '@reduxjs/toolkit';

import EventService, {
  CreateModuleEventResponsePayload,
  DeleteEventResponsePayload,
  ListEventsRequestParam,
  UpdateModuleEventRequestPayload,
  UpdateModuleEventResponsePayload,
} from 'src/services/EventService';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';
import { CreateModuleEventRequestPayload } from 'src/types/Event';

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
  async (request: { event: CreateModuleEventRequestPayload; projectsIds?: number[] }, { rejectWithValue }) => {
    const response: Response2<CreateModuleEventResponsePayload> = await EventService.createEvent(request.event);

    if (response !== null && response.requestSucceeded) {
      if (request.projectsIds && request.projectsIds.length > 0 && response.data) {
        const response2: Response2<CreateModuleEventResponsePayload> = await EventService.updateEventProjects(
          response.data.id,
          { addProjects: request.projectsIds }
        );

        if (response2 !== null && response2.requestSucceeded) {
          return response2.data;
        }
      }
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestEventProjectsUpdate = createAsyncThunk(
  'eventProjects/update',
  async (request: { projectIds: number[]; eventId: number }, { rejectWithValue }) => {
    const eventData = await EventService.get(request.eventId);

    if (eventData !== null && eventData.requestSucceeded && eventData?.data?.event !== undefined) {
      const oldProjects = eventData.data.event.projects?.map((proj) => proj.projectId) || [];

      const deletedProjects = oldProjects.filter((num) => !request.projectIds.includes(num));

      const addedProjects = request.projectIds.filter((num) => !oldProjects.includes(num));

      const response: Response2<CreateModuleEventResponsePayload> = await EventService.updateEventProjects(
        request.eventId,
        { addProjects: addedProjects, removeProjects: deletedProjects }
      );

      if (response !== null && response.requestSucceeded) {
        return response.data;
      }
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestEventDelete = createAsyncThunk(
  'event/delete',
  async (request: { eventId: number }, { rejectWithValue }) => {
    const response: Response2<DeleteEventResponsePayload> = await EventService.deleteEvent(request.eventId);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestEventUpdate = createAsyncThunk(
  'event/update',
  async (request: { eventId: number; event: UpdateModuleEventRequestPayload }, { rejectWithValue }) => {
    const response: Response2<UpdateModuleEventResponsePayload> = await EventService.updateEvent(
      request.eventId,
      request.event
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestEventDeleteMany = createAsyncThunk(
  'event/deleteMany',
  async (request: { eventsId: number[] }, { rejectWithValue }) => {
    const promises = request.eventsId.map((eventId) => EventService.deleteEvent(eventId));

    const results = await Promise.all(promises);

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
