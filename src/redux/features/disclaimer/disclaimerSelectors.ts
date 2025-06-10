import { RootState } from 'src/redux/rootReducer';

export const selectDisclaimer = (requestId: string) => (state: RootState) => state.disclaimer[requestId];

export const selectDisclaimerAccept = (requestId: string) => (state: RootState) => state.disclaimerAccept[requestId];
