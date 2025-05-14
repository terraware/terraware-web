import { createAsyncThunk } from '@reduxjs/toolkit';

import { SpeciesService } from 'src/services';
import { Response2 } from 'src/services/HttpService';
import strings from 'src/strings';
import { MergeOtherSpeciesPayload } from 'src/types/Species';

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
