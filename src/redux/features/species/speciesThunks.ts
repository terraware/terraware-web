import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { MergeOtherSpeciesPayload } from 'src/types/Species';

import { setSpeciesAction } from './speciesSlice';

export const requestSpecies = (organizationId: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const requestMergeOtherSpecies = createAsyncThunk(
  'species/mergeOthers',
  async (
    request: {
      mergeOtherSpeciesPayloads: MergeOtherSpeciesPayload[];
      observationId: number;
    },
    { rejectWithValue }
  ) => {
    const { observationId, mergeOtherSpeciesPayloads } = request;

    const promises = mergeOtherSpeciesPayloads.map((mergeOtherSpeciesPayload) =>
      SpeciesService.mergeOtherSpecies(mergeOtherSpeciesPayload, observationId)
    );

    const results = await Promise.all(promises);

    if (results.every((result) => result && result.requestSucceeded)) {
      return true;
    }
    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
