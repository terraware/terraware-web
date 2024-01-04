import { RootState } from 'src/redux/rootReducer';

export const selectReportsSettings = (state: RootState) => state.reportsSettings?.settings;
