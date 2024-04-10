import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import MethodologyService from 'src/services/documentProducer/MethodologyService';

import { selectMethodologies } from './methodologiesSelector';
import { setMethodologies } from './methodologiesSlice';

const hasFetchedMethodologies = (state: RootState): boolean =>
  (selectMethodologies(state).methodologies || []).length > 0;

export const requestListMethodologies = () => {
  return async (dispatch: Dispatch, _getState: () => RootState): Promise<void> => {
    if (hasFetchedMethodologies(_getState())) {
      return;
    }

    try {
      const response = await MethodologyService.getMethodologies();

      const methodologies = response.data?.methodologies;
      const error = response.error;

      dispatch(setMethodologies({ methodologies, error }));
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.error('Error dispatching list methodologies', e);
    }
  };
};
