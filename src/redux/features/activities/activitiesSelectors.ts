import { RootState } from 'src/redux/rootReducer';

export const selectActivityCreate = (requestId: string) => (state: RootState) => state.activityCreate[requestId];

export const selectActivityList = (requestId: string) => (state: RootState) => state.activities[requestId];

export const selectAdminActivityList = (requestId: string) => (state: RootState) => state.adminActivities[requestId];

export const selectAdminActivityCreate = (requestId: string) => (state: RootState) =>
  state.adminActivityCreate[requestId];

export const selectAdminActivityGet = (requestId: string) => (state: RootState) => state.adminActivityGet[requestId];

export const selectAdminActivityUpdate = (requestId: string) => (state: RootState) =>
  state.adminActivityUpdate[requestId];

export const selectActivityGet = (requestId: string) => (state: RootState) => state.activityGet[requestId];

export const selectActivityUpdate = (requestId: string) => (state: RootState) => state.activityUpdate[requestId];

export const selectActivityDelete = (requestId: string) => (state: RootState) => state.activityDelete[requestId];

export const selectActivityMediaUpload = (requestId: string) => (state: RootState) =>
  state.activityMediaUpload[requestId];

export const selectActivityMediaGet = (requestId: string) => (state: RootState) => state.activityMediaGet[requestId];

export const selectActivityMediaStreamGet = (requestId: string) => (state: RootState) =>
  state.activityMediaStreamGet[requestId];

export const selectActivityMediaUpdate = (requestId: string) => (state: RootState) =>
  state.activityMediaUpdate[requestId];

export const selectActivityMediaDelete = (requestId: string) => (state: RootState) =>
  state.activityMediaDelete[requestId];

export const selectFileForToken = (requestId: string) => (state: RootState) => state.fileForToken[requestId];

export const selectSyncActivityMedia = (requestId: string) => (state: RootState) => state.syncActivityMedia[requestId];
