import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/rootReducer';

export const selectAppVersion = (state: RootState) => state.appVersion.version;
const currentAppVersion = import.meta.env.PUBLIC_TERRAWARE_FE_BUILD_VERSION;

export const selectIsAppVersionStale = (state: RootState) =>
  !!state.appVersion.version && state.appVersion.version.toString().trim() !== currentAppVersion;

// simple example of composable selectors
export const selectIsAppVersionStaleExample = createSelector(
  selectAppVersion,
  (appVersion) => appVersion && appVersion.toString().trim() !== currentAppVersion
);
