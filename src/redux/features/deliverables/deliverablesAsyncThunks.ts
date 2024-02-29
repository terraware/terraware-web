import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { Response } from 'src/services/HttpService';
import DeliverablesService, { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import { DeliverableData, UpdateRequest } from 'src/types/Deliverables';

export const requestListDeliverables = createAsyncThunk(
  'deliverables/list',
  async (
    request: {
      locale: string | null;
      listRequest?: ListDeliverablesRequestParams;
      search?: SearchNodePayload;
      searchSortOrder?: SearchSortOrder;
    },
    { rejectWithValue }
  ) => {
    const { listRequest, locale, search, searchSortOrder } = request;

    const response = await DeliverablesService.listDeliverables(locale, listRequest, search, searchSortOrder);

    if (response) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestGetDeliverable = createAsyncThunk(
  'deliverables/get-one',
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
