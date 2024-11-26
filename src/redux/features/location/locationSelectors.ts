import { RootState } from 'src/redux/rootReducer';

export const selectCountryBoundary = (countryCode: string) => (state: RootState) => state.countryBoundary[countryCode];

export const selectCountries = (requestId: string) => (state: RootState) => state.countries[requestId];

export const selectTimezones = (requestId: string) => (state: RootState) => state.timezones[requestId];
