import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import AcceleratorReportService from 'src/services/AcceleratorReportService';

import { setProjectReportConfigAction } from './reportsSlice';

export const requestProjectReportConfig = (projectId: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await AcceleratorReportService.getAcceleratorReportConfig(projectId);
      dispatch(setProjectReportConfigAction({ config: response.config }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching project report config', e);
    }
  };
};
