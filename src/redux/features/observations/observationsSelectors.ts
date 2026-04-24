import { RootState } from 'src/redux/rootReducer';

export const selectScheduleObservation = (requestId: string) => (state: RootState) =>
  state.scheduleObservation[requestId];

export const selectRescheduleObservation = (requestId: string) => (state: RootState) =>
  state.rescheduleObservation[requestId];
