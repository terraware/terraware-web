import { Action, combineReducers } from '@reduxjs/toolkit';

import cohortsReducers from 'src/redux/features/cohorts/cohortsSlice';
import deliverablesReducers from 'src/redux/features/deliverables/deliverablesSlice';
import draftPlantingSiteReducers from 'src/redux/features/draftPlantingSite/draftPlantingSiteSlice';
import globalRolesReducers from 'src/redux/features/globalRoles/globalRolesSlice';
import projectsReducers from 'src/redux/features/projects/projectsSlice';
import reportsSettingsReducers from 'src/redux/features/reportsSettings/reportsSettingsSlice';
import speciesReducers from 'src/redux/features/species';

import acceleratorReducers from './features/accelerator/acceleratorSlice';
import accessionsReducers from './features/accessions/accessionsSlice';
import appVersionReducers from './features/appVersion/appVersionSlice';
import batchesReducers from './features/batches/batchesSlice';
import documentProducerReducers from './features/documentProducer';
import messageReducers from './features/message/messageSlice';
import moduleReducers from './features/modules/modulesSlice';
import observationsReducers from './features/observations/observationsSlice';
import participantProjectSpeciesReducers, {
  projectsForSpeciesReducer,
} from './features/participantProjectSpecies/participantProjectSpeciesSlice';
import participantProjectsReducers from './features/participantProjects/participantProjectsSlice';
import participantsReducers from './features/participants/participantsSlice';
import plantingsReducers from './features/plantings/plantingsSlice';
import projectToDoReducers from './features/projectToDo/projectToDoSlice';
import scoresReducers from './features/scores/scoresSlice';
import snackbarReducers from './features/snackbar/snackbarSlice';
import subLocationsReducers from './features/subLocations/subLocationsSlice';
import trackingReducers from './features/tracking/trackingSlice';
import userAnalyticsReducers from './features/user/userAnalyticsSlice';
import usersReducers from './features/user/usersSlice';
import votesReducers from './features/votes/votesSlice';

// assembly of app reducers
export const reducers = {
  ...acceleratorReducers,
  ...accessionsReducers,
  ...appVersionReducers,
  ...batchesReducers,
  ...cohortsReducers,
  ...deliverablesReducers,
  ...documentProducerReducers,
  ...draftPlantingSiteReducers,
  ...globalRolesReducers,
  ...messageReducers,
  ...moduleReducers,
  ...observationsReducers,
  ...participantsReducers,
  ...participantProjectsReducers,
  ...participantProjectSpeciesReducers,
  ...plantingsReducers,
  ...projectsReducers,
  ...projectsForSpeciesReducer,
  ...projectToDoReducers,
  ...reportsSettingsReducers,
  ...scoresReducers,
  ...snackbarReducers,
  ...speciesReducers,
  ...subLocationsReducers,
  ...trackingReducers,
  ...userAnalyticsReducers,
  ...usersReducers,
  ...votesReducers,
};
const combinedReducers = combineReducers(reducers);

// used for building the typed root state
type CombinedState = ReturnType<typeof combinedReducers>;

export const rootReducer = (state: CombinedState | undefined, action: Action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }

  return combinedReducers(state as any, action);
};

export type RootState = ReturnType<typeof rootReducer>;
