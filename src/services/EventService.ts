import { paths } from 'src/api/types/generated-schema';
import { ModuleEvent } from 'src/types/Module';

import HttpService, { Response2 } from './HttpService';

export type EventsData = {
  events: ModuleEvent[] | undefined;
};

export type EventData = {
  event: ModuleEvent | undefined;
};

const EVENTS_ENDPOINT = '/api/v1/accelerator/events';
const EVENT_ENDPINT = '/api/v1/accelerator/events/{eventId}';

export type ListEventsResponsePayload =
  paths[typeof EVENTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type GetEventResponsePayload =
  paths[typeof EVENT_ENDPINT]['get']['responses'][200]['content']['application/json'];

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
  return HttpService.root(EVENT_ENDPINT).get<GetEventResponsePayload, { data: EventData | undefined }>(
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

const EventService = {
  get,
  list,
};

export default EventService;
