import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import DeliverablesService from 'src/services/DeliverablesService';
import { setDeliverableListAction } from 'src/redux/features/deliverables/deliverablesSlice';

export const requestDeliverables = (
  organizationId: number,
  searchCriteria?: SearchCriteria,
  sortOrder?: SearchSortOrder
) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const results = await (organizationId === -1
        ? DeliverablesService.searchDeliverablesForAdmin(organizationId, searchCriteria, sortOrder)
        : DeliverablesService.searchDeliverablesForParticipant(organizationId, searchCriteria, sortOrder));

      if (!results?.length) {
        dispatch(setDeliverableListAction({ organizationId, data: { error: true } }));
        return;
      }

      dispatch(setDeliverableListAction({ organizationId, data: { deliverables: results } }));
    } catch (e: unknown) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      const errorMessage = (e as Error).message ?? e;
      dispatch(
        setDeliverableListAction({
          organizationId,
          data: { error: `Error dispatching request deliverables - ${errorMessage}` },
        })
      );
    }
  };
};
