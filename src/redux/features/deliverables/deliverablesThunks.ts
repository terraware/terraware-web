import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import DeliverablesService from 'src/services/DeliverablesService';
import { setDeliverableAction, setDeliverableListAction } from 'src/redux/features/deliverables/deliverablesSlice';

export const requestDeliverableList = (
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

export const requestDeliverable = (deliverableId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const result = await DeliverablesService.getDeliverable(deliverableId);

      if (!result) {
        dispatch(setDeliverableAction({ deliverableId, data: { error: true } }));
        return;
      }

      dispatch(setDeliverableAction({ deliverableId, data: { deliverable: result } }));
    } catch (e: unknown) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      const errorMessage = (e as Error).message ?? e;
      dispatch(
        setDeliverableAction({
          deliverableId,
          data: { error: `Error dispatching request to get deliverable - ${errorMessage}` },
        })
      );
    }
  };
};
