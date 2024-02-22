import { createAsyncThunk } from '@reduxjs/toolkit';
import strings from 'src/strings';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import { Response } from 'src/services/HttpService';
import DeliverablesService, {
  DeliverableData,
  SearchResponseDeliverableAdmin,
  SearchResponseDeliverableBase,
} from 'src/services/DeliverablesService';

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
  async (request: { deliverableId: number }, { rejectWithValue }) => {
    const { deliverableId } = request;

    const response: Response & DeliverableData = await DeliverablesService.getDeliverable(deliverableId);
    if (response && response.requestSucceeded) {
      return response.deliverable;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
