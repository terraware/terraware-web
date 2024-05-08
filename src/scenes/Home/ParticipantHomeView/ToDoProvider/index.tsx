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
import { ToDoItem } from 'src/types/ProjectToDo';

import { ToDoContext, ToDoData } from './Context';

export type Props = {
  children?: React.ReactNode;
};

const ToDoProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { currentParticipantProject } = useParticipantData();

  const [allItems, setAllItems] = useState<ToDoItem[]>([]);
  const [toDoItems, setToDoItems] = useState<ToDoItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<ToDoItem[]>([]);
  const [projectId, setProjectId] = useState<number>(-1);

  const [deliverablesRequestId, setDeliverablesRequestId] = useState('');
  const [eventsRequestId, setEventsRequestId] = useState('');

  const toDoDeliverables = useAppSelector(selectProjectToDoDeliverables(deliverablesRequestId));
  const toDoEvents = useAppSelector(selectProjectToDoEvents(eventsRequestId));

  const [toDoData, setToDoData] = useState<ToDoData>({
    projectId: projectId,
    allItems: allItems,
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
  }, [dispatch, currentParticipantProject, setDeliverablesRequestId, setEventsRequestId, setProjectId]);

  useEffect(() => {
    if (!toDoDeliverables || !toDoEvents) {
      return;
    }

    if (
      toDoDeliverables.status === 'success' &&
      toDoDeliverables.data &&
      toDoEvents.status === 'success' &&
      toDoEvents.data
    ) {
      setAllItems(
        [...toDoDeliverables.data, ...toDoEvents.data].sort(
          (left, right) => left.getDate().valueOf() - right.getDate().valueOf()
        )
      );
    }
  }, [toDoDeliverables, toDoEvents, setAllItems]);

  useEffect(() => {
    setToDoItems(allItems.filter((item) => item.getSection() == 'To Do').slice(0, 3));
    setUpcomingItems(allItems.filter((item) => item.getSection() == 'Upcoming').slice(0, 3));
  }, [allItems, setToDoItems, setUpcomingItems]);

  useEffect(() => {
    setToDoData({
      projectId: projectId,
      allItems: allItems,
      toDoItems: toDoItems,
      upcomingItems: upcomingItems,
    });
  }, [projectId, allItems, toDoItems, upcomingItems]);

  return (
    <ToDoContext.Provider value={toDoData}>
      {children}
      <Outlet />
    </ToDoContext.Provider>
  );
};

export default ToDoProvider;
