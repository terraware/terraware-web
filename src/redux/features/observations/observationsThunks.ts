import { Dispatch } from 'redux';
import { ObservationsService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setObservationsAction, setObservationsResultsAction } from './observationsSlice';

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

/**
 * Fetch observations
 */
export const requestObservations = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await ObservationsService.listObservations(organizationId);
      const { error, observations } = response;
      dispatch(
        setObservationsAction({
          error,
          observations,
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching observations', e);
    }
  };
};
