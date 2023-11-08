import { Dispatch } from 'redux';
import { PlantingsService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setPlantingsAction } from './plantingsSlice';

export const requestPlantings = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await PlantingsService.listPlantings(organizationId, {});
      const plantings = response?.flatMap((r) => (r as any).delivery.plantings);
      dispatch(setPlantingsAction({ plantings }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching species', e);
    }
  };
};
