import { RootState } from 'src/redux/rootReducer';
import { requestPlantingSiteReportedPlants } from './plantingsThunks';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const selectPlantingsDateRange = (state: RootState, dateRange: string[]) =>
  selectPlantings(state)?.filter((planting) => {
    if (!dateRange || dateRange.length === 0) {
      return true;
    }
    return planting.createdTime > dateRange[0] && (dateRange.length < 2 || planting.createdTime < dateRange[1]);
  }) ?? [];

export const selectPlantingSiteReportedPlants = (state: RootState, plantingSiteId: number) =>
  state.plantingSiteReportedPlants;
