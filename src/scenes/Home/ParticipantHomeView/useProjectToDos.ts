import { useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import useDeliverablesWithOverdue from 'src/hooks/useDeliverablesWithOverdue';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useListEventsQuery } from 'src/queries/generated/moduleEvents';
import { DeliverableToDoItem } from 'src/types/DeliverableToDoItem';
import { DeliverableStatusTypeWithOverdue, ListDeliverablesElementWithOverdueAndDueDate } from 'src/types/Deliverables';
import { ModuleEventStatus, ModuleEventWithStartTime } from 'src/types/Module';
import { EventToDoItem, ToDoItem, compareToDoItems } from 'src/types/ProjectToDo';

const TODO_DELIVERABLE_STATUSES: DeliverableStatusTypeWithOverdue[] = ['Not Submitted', 'Rejected', 'Overdue'];
const TODO_EVENT_STATUSES: ModuleEventStatus[] = ['Not Started', 'Starting Soon', 'In Progress'];
const MAX_ITEMS = 6;

const useProjectToDos = () => {
  const { currentAcceleratorProject } = useParticipantData();

  const projectId =
    currentAcceleratorProject && !isNaN(currentAcceleratorProject.id) && currentAcceleratorProject.id > 0
      ? currentAcceleratorProject.id
      : undefined;

  const { deliverables } = useDeliverablesWithOverdue(projectId !== undefined ? { projectId } : skipToken);
  const { currentData: eventsData } = useListEventsQuery(projectId !== undefined ? { projectId } : skipToken);

  return useMemo(() => {
    if (!deliverables || !eventsData) {
      return { toDoItems: [], upcomingItems: [] };
    }

    const sortedDeliverables = deliverables
      .filter(
        (deliverable): deliverable is ListDeliverablesElementWithOverdueAndDueDate =>
          TODO_DELIVERABLE_STATUSES.includes(deliverable.status) && deliverable.dueDate !== undefined
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map((deliverable) => new DeliverableToDoItem(deliverable))
      .sort(compareToDoItems);
    const sortedEvents = eventsData.events
      .filter(
        (event): event is ModuleEventWithStartTime =>
          TODO_EVENT_STATUSES.includes(event.status) && event.startTime !== undefined
      )
      .map((event) => new EventToDoItem(event))
      .sort(compareToDoItems);

    const toDoDeliverables = sortedDeliverables.filter((item) => item.getSection() === 'To Do');
    const toDoEvents = sortedEvents.filter((item) => item.getSection() === 'To Do');
    const allUpcomingItems = [
      ...sortedDeliverables.filter((item) => item.getSection() === 'Upcoming'),
      ...sortedEvents.filter((item) => item.getSection() === 'Upcoming'),
    ].sort(compareToDoItems);

    const toDoItems: ToDoItem[] = toDoDeliverables.slice(0, 3);
    toDoItems.push(...toDoEvents.slice(0, MAX_ITEMS - toDoItems.length));
    const upcomingItems = allUpcomingItems.slice(0, Math.max(MAX_ITEMS - toDoItems.length, 0));

    return { toDoItems: toDoItems.sort(compareToDoItems), upcomingItems };
  }, [deliverables, eventsData]);
};

export default useProjectToDos;
