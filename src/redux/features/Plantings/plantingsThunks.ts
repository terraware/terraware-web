import { Dispatch } from 'redux';
import { PlantingsService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setPlantingSiteReportedPlantsAction, setPlantingsAction } from './plantingsSlice';

export const requestPlantings = (organizationId: number, plantingSiteId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await PlantingsService.listPlantings(organizationId, [
        {
          field: 'delivery.plantings.plantingSite.id',
          values: [plantingSiteId.toString()],
          type: 'Exact',
          operation: 'field',
        },
      ]);

      const plantings = response?.flatMap((r) => (r as any).delivery.plantings);
      dispatch(setPlantingsAction({ plantings }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching species', e);
    }
  };
};

export const requestPlantingSiteReportedPlants = (plantingSiteId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await PlantingsService.listPlantingSiteReportedPlants(plantingSiteId);
      const { error, site } = response;
      dispatch(
        setPlantingSiteReportedPlantsAction({
          error,
          site,
        })
      );
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching planting site reported plants', e);
    }
  };
};
