import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import {
  requestProjectToDoDeliverables,
  requestProjectToDoEvents,
} from 'src/redux/features/projectToDo/projectToDoAsyncThunk';
import {
  selectProjectToDoDeliverables,
  selectProjectToDoEvents,
} from 'src/redux/features/projectToDo/projectToDoSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ToDoItem, compareToDoItems } from 'src/types/ProjectToDo';

import { ToDoContext, ToDoData } from './Context';

export type Props = {
  children?: React.ReactNode;
};

const ToDoProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { currentAcceleratorProject } = useParticipantData();

  const [toDoItems, setToDoItems] = useState<ToDoItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<ToDoItem[]>([]);
  const [projectId, setProjectId] = useState<number>(-1);

  const [deliverablesRequestId, setDeliverablesRequestId] = useState('');
  const [eventsRequestId, setEventsRequestId] = useState('');

  const toDoDeliverablesRequest = useAppSelector(selectProjectToDoDeliverables(deliverablesRequestId));
  const toDoEventsRequest = useAppSelector(selectProjectToDoEvents(eventsRequestId));

  const [toDoData, setToDoData] = useState<ToDoData>({
    projectId,
    toDoItems,
    upcomingItems,
  });

  useEffect(() => {
    if (currentAcceleratorProject && !isNaN(currentAcceleratorProject.id) && currentAcceleratorProject.id > 0) {
      setProjectId(currentAcceleratorProject.id);
      const deliverablesRequest = dispatch(
        requestProjectToDoDeliverables({ locale: activeLocale, projectId: currentAcceleratorProject.id })
      );
      const eventsRequest = dispatch(requestProjectToDoEvents({ projectId: currentAcceleratorProject.id }));
      setDeliverablesRequestId(deliverablesRequest.requestId);
      setEventsRequestId(eventsRequest.requestId);
    }
  }, [dispatch, currentAcceleratorProject, activeLocale]);

  useEffect(() => {
    if (!toDoDeliverablesRequest || !toDoEventsRequest) {
      return;
    }

    if (
      toDoDeliverablesRequest.status === 'success' &&
      toDoDeliverablesRequest.data &&
      toDoEventsRequest.status === 'success' &&
      toDoEventsRequest.data
    ) {
      const allDeliverables = [...toDoDeliverablesRequest.data];
      const allEvents = [...toDoEventsRequest.data];

      const sortedDeliverables = allDeliverables.sort(compareToDoItems);
      const sortedEvents = allEvents.sort(compareToDoItems);

      const toDoDeliverables = sortedDeliverables.filter((deliverable) => deliverable.getSection() === 'To Do');
      const upcomingDeliverables = sortedDeliverables.filter((deliverable) => deliverable.getSection() === 'Upcoming');

      const toDoEvents = sortedEvents.filter((event) => event.getSection() === 'To Do');
      const upcomingEvents = sortedEvents.filter((event) => event.getSection() === 'Upcoming');

      const allUpcomingItems = [...upcomingDeliverables, ...upcomingEvents].sort(compareToDoItems);

      const maxItems = 6;
      const nextToDoItems: ToDoItem[] = [];
      const nextUpcomingItems: ToDoItem[] = [];

      nextToDoItems.push(...toDoDeliverables.splice(0, 3));
      nextToDoItems.push(...toDoEvents.splice(0, maxItems - nextToDoItems.length));

      if (maxItems - nextToDoItems.length > 0) {
        nextUpcomingItems.push(...allUpcomingItems.splice(0, maxItems - nextToDoItems.length));
      }

      setToDoItems(nextToDoItems.sort(compareToDoItems));
      setUpcomingItems(nextUpcomingItems);
    }
  }, [toDoDeliverablesRequest, toDoEventsRequest]);

  useEffect(() => {
    setToDoData({
      projectId,
      toDoItems,
      upcomingItems,
    });
  }, [projectId, toDoItems, upcomingItems]);

  return (
    <ToDoContext.Provider value={toDoData}>
      {children}
      <Outlet />
    </ToDoContext.Provider>
  );
};

export default ToDoProvider;
