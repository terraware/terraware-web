import { RootState } from 'src/redux/rootReducer';

export const listOrganizationFeatures = (requestId: string) => (state: RootState) => state.features[requestId];
