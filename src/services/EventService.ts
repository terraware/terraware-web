import { paths } from 'src/api/types/generated-schema';
import { CreateModuleEventRequestPayload, UpdateModuleEventProjectsRequestPayload } from 'src/types/Event';
import { ModuleEvent } from 'src/types/Module';

import HttpService, { Response, Response2 } from './HttpService';

export type EventsData = {
  events: ModuleEvent[] | undefined;
};

export type EventData = {
  event: ModuleEvent | undefined;
};

const EVENTS_ENDPOINT = '/api/v1/accelerator/events';
const EVENT_ENDPONT = '/api/v1/accelerator/events/{eventId}';
const EVENT_PROJECTS_ENDPOINT = '/api/v1/accelerator/events/{eventId}/projects';

export type ListEventsResponsePayload =
  paths[typeof EVENTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type GetEventResponsePayload =
  paths[typeof EVENT_ENDPONT]['get']['responses'][200]['content']['application/json'];
export type CreateModuleEventResponsePayload =
  paths[typeof EVENTS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ListEventsRequestParam = {
  projectId?: number;
  moduleId?: number;
};

/**
 * List all events
 */
const list = ({ projectId, moduleId }: ListEventsRequestParam): Promise<Response2<EventsData | null>> => {
  const params: Record<string, string> = {};
  if (projectId) {
    params.projectId = `${projectId}`;
  }

  if (moduleId) {
    params.moduleId = `${moduleId}`;
  }

  return HttpService.root(EVENTS_ENDPOINT).get<ListEventsResponsePayload, { data: EventsData | undefined }>(
    {
      params,
    },
    (response) => ({
      data: {
        events: response?.events,
      },
    })
  );
};

/**
 * Get module data
 */
const get = async (eventId: number): Promise<Response2<EventData | null>> => {
  return HttpService.root(EVENT_ENDPONT).get<GetEventResponsePayload, { data: EventData | undefined }>(
    {
      urlReplacements: { '{eventId}': `${eventId}` },
    },
    (response) => ({
      data: {
        event: response?.event,
      },
    })
  );
};

/**
 * Create an event
 */
const createEvent = (event: CreateModuleEventRequestPayload): Promise<Response> =>
  HttpService.root(EVENTS_ENDPOINT).post({
    entity: event,
  });

const updateEventProjects = (eventId: number, entity: UpdateModuleEventProjectsRequestPayload): Promise<Response> =>
  HttpService.root(EVENT_PROJECTS_ENDPOINT.replace('{eventId}', eventId.toString())).post({
    entity,
  });

const EventService = {
  get,
  list,
  createEvent,
  updateEventProjects,
};

export default EventService;
