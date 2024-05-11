import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

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
  const { currentParticipantProject } = useParticipantData();

  const [toDoItems, setToDoItems] = useState<ToDoItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<ToDoItem[]>([]);
  const [projectId, setProjectId] = useState<number>(-1);

  const [deliverablesRequestId, setDeliverablesRequestId] = useState('');
  const [eventsRequestId, setEventsRequestId] = useState('');

  const toDoDeliverablesRequest = useAppSelector(selectProjectToDoDeliverables(deliverablesRequestId));
  const toDoEventsRequest = useAppSelector(selectProjectToDoEvents(eventsRequestId));

  const [toDoData, setToDoData] = useState<ToDoData>({
    projectId: projectId,
    toDoItems: toDoItems,
    upcomingItems: upcomingItems,
  });

  useEffect(() => {
    if (currentParticipantProject && !isNaN(currentParticipantProject.id) && currentParticipantProject.id > 0) {
      setProjectId(currentParticipantProject.id);
      const deliverablesRequest = dispatch(requestProjectToDoDeliverables({ projectId: currentParticipantProject.id }));
      const eventsRequest = dispatch(requestProjectToDoEvents({ projectId: currentParticipantProject.id }));
      setDeliverablesRequestId(deliverablesRequest.requestId);
      setEventsRequestId(eventsRequest.requestId);
    }
  }, [dispatch, currentParticipantProject]);

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

      console.log(upcomingDeliverables);

      const toDoEvents = sortedEvents.filter((event) => event.getSection() === 'To Do');
      const upcomingEvents = sortedEvents.filter((event) => event.getSection() === 'Upcoming');

      const upcomingItems = [...upcomingDeliverables, ...upcomingEvents].sort(compareToDoItems);

      const maxItems = 6;
      const nextToDoItems: ToDoItem[] = [];
      const nextUpcomingItems: ToDoItem[] = [];

      nextToDoItems.push(...toDoDeliverables.splice(0, 3));
      nextToDoItems.push(...toDoEvents.splice(0, maxItems - nextToDoItems.length));

      if (maxItems - nextToDoItems.length > 0) {
        nextUpcomingItems.push(...upcomingItems.splice(0, maxItems - nextToDoItems.length));
      }

      setToDoItems(nextToDoItems.sort(compareToDoItems));
      setUpcomingItems(nextUpcomingItems);
    }
  }, [toDoDeliverablesRequest, toDoEventsRequest]);

  useEffect(() => {
    setToDoData({
      projectId: projectId,
      toDoItems: toDoItems,
      upcomingItems: upcomingItems,
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
