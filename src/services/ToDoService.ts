import { ListDeliverablesElementWithOverdueAndDueDate } from 'src/types/Deliverables';
import { ModuleEventStatus, ModuleEventWithStartTime } from 'src/types/Module';

import DeliverablesService from './DeliverablesService';
import EventService from './EventService';

const searchDeliverables = async (
  locale: string | null,
  projectId: number
): Promise<ListDeliverablesElementWithOverdueAndDueDate[]> => {
  const listDeliverablesResponse = await DeliverablesService.list(
    locale,
    { projectId },
    {
      operation: 'field',
      field: 'status',
      type: 'Exact',
      values: ['Not Submitted', 'Rejected', 'Overdue'],
    },
    {
      field: 'dueDate',
    }
  );

  if (listDeliverablesResponse.requestSucceeded && listDeliverablesResponse.data) {
    return listDeliverablesResponse.data.filter(
      (item): item is ListDeliverablesElementWithOverdueAndDueDate => item.dueDate !== undefined
    );
  } else {
    return [];
  }
};

const searchEvents = async (projectId: number): Promise<ModuleEventWithStartTime[]> => {
  const listEventsResponse = await EventService.list({ projectId });

  if (listEventsResponse.requestSucceeded && listEventsResponse.data) {
    const events = listEventsResponse.data.events ?? [];
    const todoStatues: ModuleEventStatus[] = ['Not Started', 'Starting Soon', 'In Progress'];
    return events.filter(
      (event): event is ModuleEventWithStartTime => todoStatues.includes(event.status) && event.startTime !== undefined
    );
  } else {
    return [];
  }
};

/**
 * Exported functions
 */
const ToDoService = {
  searchDeliverables,
  searchEvents,
};

export default ToDoService;
