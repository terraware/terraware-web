import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from 'src/strings';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import { Response } from 'src/services/HttpService';
import DeliverablesService from 'src/services/DeliverablesService';
import {
  DeliverableData,
  SearchResponseDeliverableAdmin,
  SearchResponseDeliverableBase,
  UpdateStatusRequest,
} from 'src/types/Deliverables';

export const requestDeliverablesSearch = createAsyncThunk(
  'deliverables/search',
  async (
    request: { organizationId: number; searchCriteria?: SearchCriteria; sortOrder?: SearchSortOrder },
    { rejectWithValue }
  ) => {
    const { organizationId, searchCriteria, sortOrder } = request;

    const response: (SearchResponseDeliverableAdmin | SearchResponseDeliverableBase)[] | null =
      await (organizationId === -1
        ? DeliverablesService.searchDeliverablesForAdmin(organizationId, searchCriteria, sortOrder)
        : DeliverablesService.searchDeliverablesForParticipant(organizationId, searchCriteria, sortOrder));

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

export const requestUpdateDeliverableStatus = createAsyncThunk(
  'deliverables/update-status',
  async (request: UpdateStatusRequest, { rejectWithValue }) => {
    const response: Response = await DeliverablesService.updateStatus(request);
    if (response && response.requestSucceeded) {
      return request.id;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
