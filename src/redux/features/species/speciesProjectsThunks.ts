import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { SpeciesService } from 'src/services';
import { SpeciesProjectsSearchResponse } from 'src/services/SpeciesService';

import { setSpeciesProjectsAction } from './speciesProjectsSlice';

export const requestSpeciesProjects = (organizationId: number, speciesId: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response: SpeciesProjectsSearchResponse[] | null = await SpeciesService.getSpeciesProjects(
        organizationId,
        speciesId
      );

      if (response) {
        const projectsForSpecies = response.shift();
        if (projectsForSpecies) {
          dispatch(setSpeciesProjectsAction({ projects: projectsForSpecies.projects, speciesId }));
        }
      }
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching request to get projects for a species', e);
    }
  };
};
