import { RootState } from 'src/redux/rootReducer';

export const selectAccessions = (organizationId: number, speciesId?: number) => (state: RootState) =>
  state.accessions[`${organizationId}-${speciesId ?? 0}`];
