import { RootState } from 'src/redux/rootReducer';
import { createSelector } from '@reduxjs/toolkit';

export const selectAppVersion = (state: RootState) => state.appVersion.version;
const currentAppVersion = process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION;

export const selectIsAppVersionStale = (state: RootState) =>
  !!state.appVersion.version && state.appVersion.version.toString().trim() !== currentAppVersion;

// simple example of composable selectors
export const EXAMPLE_selectIsAppVersionStale_EXAMPLE = createSelector(
  selectAppVersion,
  (appVersion) => appVersion && appVersion.toString().trim() !== currentAppVersion
);
