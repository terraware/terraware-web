import { Dispatch } from 'redux';
import { SpeciesService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { setSpeciesProjectsAction } from './speciesProjectsSlice';
import { SpeciesProjectsSearchResponse } from 'src/services/SpeciesService';

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
