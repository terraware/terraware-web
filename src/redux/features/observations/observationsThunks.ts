import { Dispatch } from 'redux';
import { ObservationsService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setObservationsResultsAction } from './observationsSlice';

/**
 * Fetch observation results
 */
export const requestObservationsResults = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ObservationsService.listObservationsResults(organizationId);
      const { error, observations } = response;
      dispatch(
        setObservationsResultsAction({
          error,
          observations,
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching observations results', e);
    }
  };
};
