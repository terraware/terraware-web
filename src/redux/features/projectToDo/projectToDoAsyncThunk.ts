import { createAsyncThunk } from '@reduxjs/toolkit';

import ToDoService from 'src/services/ToDoService';
import { DeliverableToDoItem } from 'src/types/DeliverableToDoItem';
import { EventToDoItem } from 'src/types/ProjectToDo';

export const requestProjectToDoDeliverables = createAsyncThunk(
  'projectToDoList/getDeliverables',
  async (request: { locale: string | null; projectId: number }) => {
    const deliverableSearchResults = await ToDoService.searchDeliverables(request.locale, request.projectId);
    return deliverableSearchResults ? deliverableSearchResults.map((result) => new DeliverableToDoItem(result)) : [];
  }
);

export const requestProjectToDoEvents = createAsyncThunk(
  'projectToDoList/getEvents',
  async (request: { projectId: number }) => {
    const eventSearchResults = await ToDoService.searchEvents(request.projectId);
    return eventSearchResults ? eventSearchResults.map((result) => new EventToDoItem(result)) : [];
  }
);
