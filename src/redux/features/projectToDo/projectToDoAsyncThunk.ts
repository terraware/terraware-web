import { createAsyncThunk } from '@reduxjs/toolkit';

import { SearchService } from 'src/services';
import {
  DeliverableSearchResultType,
  DeliverableToDoItem,
  EventSearchResultType,
  EventToDoItem,
} from 'src/types/ProjectToDo';
import { SearchRequestPayload } from 'src/types/Search';

export const requestProjectToDoDeliverables = createAsyncThunk(
  'projectToDoList/getDeliverables',
  async (request: { projectId: number }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'projects.projectDeliverables',
      fields: [
        'id',
        'module_id',
        'module_name',
        'project_id',
        'name',
        'description',
        'dueDate',
        'status',
        'type',
        'category',
      ],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'project.id',
            type: 'Exact',
            values: [request.projectId],
          },
          {
            operation: 'field',
            field: 'status',
            type: 'Exact',
            values: [null, 'Not Submitted', 'Rejected'],
          },
        ],
      },
      sortOrder: [
        {
          field: 'dueDate',
        },
      ],
      count: 20,
    };

    const response = await SearchService.search(searchParams);
    const deliverableSearchResults = response ? (response as DeliverableSearchResultType[]) : [];

    return deliverableSearchResults.map((result) => new DeliverableToDoItem(result));
  }
);

export const requestProjectToDoEvents = createAsyncThunk(
  'projectToDoList/getEvents',
  async (request: { projectId: number }) => {
    const searchParams: SearchRequestPayload = {
      prefix: 'projects.events',
      fields: ['id', 'module_id', 'module_name', 'projects_id', 'startTime', 'status', 'type'],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'projects.id',
            type: 'Exact',
            values: [request.projectId],
          },
          {
            operation: 'field',
            field: 'status',
            type: 'Exact',
            values: ['In Progress', 'Not Started', 'Starting Soon'],
          },
        ],
      },
      sortOrder: [
        {
          field: 'startTime',
        },
      ],
      count: 20,
    };

    const response = await SearchService.search(searchParams);
    const eventSearchResults = response ? (response as EventSearchResultType[]) : [];

    return eventSearchResults.map((result) => new EventToDoItem(result));
  }
);
