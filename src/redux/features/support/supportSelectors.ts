import { RootState } from 'src/redux/rootReducer';

export const selectSupportRequestTypesByRequest = (requestId: string) => (state: RootState) =>
  state.supportRequestTypes[requestId];
export const selectSupportRequestSubmitRequest = (requestId: string) => (state: RootState) =>
  state.supportRequestSubmit[requestId];
export const selectSupportUploadAttachmentRequest = (requestId: string) => (state: RootState) =>
  state.supportAttachmentUpload[requestId];
export const selectManySupportUploadAttachmentRequests = (requestIds: string[]) => (state: RootState) =>
  requestIds.map((requestId) => state.supportAttachmentUpload[requestId]);
