import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { SystemService } from 'src/services';

import { setVersionAction } from './appVersionSlice';

export const requestAppVersion = () => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await SystemService.getLatestAppVersion();
      dispatch(setVersionAction(response.version));
    } catch (e) {
      // add error handling
    }
  };
};
