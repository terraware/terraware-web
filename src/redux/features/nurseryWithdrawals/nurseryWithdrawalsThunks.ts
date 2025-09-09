import { createAsyncThunk } from '@reduxjs/toolkit';

import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';

export type SpeciesPlot = {
  monitoringPlotId: number;
  species: {
    density: number;
    speciesId: number;
  }[];
};

export const requestPlantingSiteWithdrawnSpecies = createAsyncThunk(
  'plantingSiteWithdrawnSpecies/get',
  async (plantingSiteId: number, { rejectWithValue }) => {
    const response = await NurseryWithdrawalService.getPlantingSiteWithdrawnSpecies(plantingSiteId);

    if (response) {
      return response.data?.plots;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
