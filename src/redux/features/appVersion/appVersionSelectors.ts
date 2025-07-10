import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'src/redux/rootReducer';

export const selectAppVersion = (state: RootState) => state.appVersion.version;
const currentAppVersion = process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION;

export const selectIsAppVersionStale = (state: RootState) => {
  console.log('currentAppVersion:', currentAppVersion);
  console.log('state.appVersion.version:', state.appVersion.version);
  return !!state.appVersion.version && state.appVersion.version.toString().trim() !== currentAppVersion;
};

// simple example of composable selectors
export const selectIsAppVersionStaleExample = createSelector(
  selectAppVersion,
  (appVersion) => appVersion && appVersion.toString().trim() !== currentAppVersion
);
