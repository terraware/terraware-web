import { Dispatch } from 'redux';

import { setReportsSettingsAction } from 'src/redux/features/reportsSettings/reportsSettingsSlice';
import { RootState } from 'src/redux/rootReducer';
import ReportSettingsService, { GetReportsSettingsResponse } from 'src/services/ReportSettingsService';

export const requestReportsSettings = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response: GetReportsSettingsResponse = await ReportSettingsService.getReportsSettings(organizationId);

      dispatch(setReportsSettingsAction({ settings: response }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching request to get projects for a species', e);
    }
  };
};
