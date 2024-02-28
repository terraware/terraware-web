import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { Response } from 'src/services/HttpService';
import DeliverablesService from 'src/services/DeliverablesService';
import { DeliverableData, SearchResponseDeliverable, UpdateRequest } from 'src/types/Deliverables';

export const requestDeliverablesSearch = createAsyncThunk(
  'deliverables/search',
  async (
    request: { organizationId: number; search?: SearchNodePayload; searchSortOrder?: SearchSortOrder },
    { rejectWithValue }
  ) => {
    const { organizationId, search, searchSortOrder } = request;

    const response: SearchResponseDeliverable[] | null = await (organizationId === -1
      ? DeliverablesService.searchDeliverablesForAdmin(organizationId, search, searchSortOrder)
      : DeliverablesService.searchDeliverablesForParticipant(organizationId, search, searchSortOrder));

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeliverableFetch = createAsyncThunk(
  'deliverables/fetch-one',
  async (deliverableId: number, { rejectWithValue }) => {
    const response: Response & DeliverableData = await DeliverablesService.getDeliverable(deliverableId);
    if (response && response.requestSucceeded) {
      return response.deliverable;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestDeliverableUpdate = createAsyncThunk(
  'deliverables/update',
  async (request: UpdateRequest, { rejectWithValue }) => {
    const response: Response = await DeliverablesService.update(request);
    if (response && response.requestSucceeded) {
      return request.id;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
