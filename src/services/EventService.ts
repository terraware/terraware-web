import { paths } from 'src/api/types/generated-schema';
import { ModuleEvent } from 'src/types/Module';

import HttpService, { Response2 } from './HttpService';

type EventsData = {
  events: ModuleEvent[] | undefined;
};

const EVENTS_ENDPOINT = '/api/v1/accelerator/events';

type ListEventsResponsePayload = paths[typeof EVENTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ListEventsRequestParam = {
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

const EventService = {
  list,
};

export default EventService;
