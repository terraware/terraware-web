import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { SpeciesService } from 'src/services';

import { setSpeciesAction } from './speciesSlice';

export const requestSpecies = (organizationId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await SpeciesService.getAllSpecies(organizationId);
      const { error, species } = response;
      dispatch(setSpeciesAction({ error, species }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching species', e);
    }
  };
};
