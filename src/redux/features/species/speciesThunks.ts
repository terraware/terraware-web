import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import { SpeciesService } from 'src/services';
import { Response2 } from 'src/services/HttpService';
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

export type MergeOtherSpeciesRequestData = MergeOtherSpeciesPayload & {
  newName: string;
};

export const requestMergeOtherSpecies = createAsyncThunk(
  'species/mergeOthers',
  async (
    request: {
      mergeOtherSpeciesRequestData: MergeOtherSpeciesRequestData[];
      observationId: number;
    },
    { rejectWithValue }
  ) => {
    const { observationId, mergeOtherSpeciesRequestData } = request;

    const promises: Promise<Response2<MergeOtherSpeciesRequestData>>[] = mergeOtherSpeciesRequestData.map(
      async (mergeOtherSpeciesRequestDatum) => {
        const result = await SpeciesService.mergeOtherSpecies(
          {
            otherSpeciesName: mergeOtherSpeciesRequestDatum.otherSpeciesName,
            speciesId: mergeOtherSpeciesRequestDatum.speciesId,
          },
          observationId
        );

        if (!result.requestSucceeded) {
          return result;
        }

        return {
          ...result,
          data: mergeOtherSpeciesRequestDatum,
        };
      }
    );

    const results: Response2<MergeOtherSpeciesRequestData>[] = await Promise.all(promises);

    if (results.every((result) => result && result.requestSucceeded)) {
      return results.map((result) => result.data);
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
