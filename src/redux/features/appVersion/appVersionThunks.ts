import { Dispatch } from 'redux';
import { getLatestAppVersion } from 'src/api/appVersion';
import { RootState } from 'src/redux/rootReducer';
import { setVersionAction } from './appVersionSlice';

export const requestAppVersion = () => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await getLatestAppVersion();
      dispatch(setVersionAction(response.version));
    } catch (e) {
      // add error handling
    }
  };
};
