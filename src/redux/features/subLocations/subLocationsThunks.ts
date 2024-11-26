import { Dispatch } from 'redux';

import { setSubLocationsAction } from 'src/redux/features/subLocations/subLocationsSlice';
import { RootState } from 'src/redux/rootReducer';
import { SubLocationService } from 'src/services';

export const requestSubLocations = (facilityIds: number[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      if (facilityIds.length) {
        const resultPromises = facilityIds.map((f) => SubLocationService.getSubLocations(f));
        const results = await Promise.all(resultPromises);
        const subLocations = results.flatMap((r) => r.subLocations);
        const errors = results.flatMap((r) => r.error).filter((e) => e !== undefined) as string[];

        dispatch(setSubLocationsAction({ errors, subLocations }));
      } else {
        dispatch(setSubLocationsAction({ errors: undefined, subLocations: [] }));
      }
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching subLocations', e);
    }
  };
};
