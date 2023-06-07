import { Dispatch } from 'redux';
import { TrackingService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setPlantingSitesAction } from './trackingSlice';

export const requestPlantingSites = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await TrackingService.listPlantingSites(organizationId, true);
      const { error, sites } = response;
      dispatch(setPlantingSitesAction({ error, plantingSites: sites }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching planting sites', e);
    }
  };
};
