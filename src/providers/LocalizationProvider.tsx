import React, { type JSX, useEffect, useState } from 'react';
import LocalizedStrings from 'react-localization';

import { requestListCountries, requestListTimezones } from 'src/redux/features/location/locationAsyncThunks';
import { selectCountries, selectTimezones } from 'src/redux/features/location/locationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { HttpService } from 'src/services';
import defaultStrings, { ILocalizedStringsMap } from 'src/strings';
import { Country } from 'src/types/Country';
import { TimeZoneDescription } from 'src/types/TimeZones';

import { ProvidedLocalizationData, useUser } from '.';
import { useSupportedLocales } from '../strings/locales';
import { LocalizationContext } from './contexts';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
  selectedLocale: string | null;
  setSelectedLocale: (locale: string) => void;
  activeLocale: string | null;
  setActiveLocale: (locale: string) => void;
};

export default function LocalizationProvider({
  children,
  selectedLocale,
  setSelectedLocale,
  activeLocale,
  setActiveLocale,
}: LocalizationProviderProps): JSX.Element | null {
  const dispatch = useAppDispatch();

  const [countries, setCountries] = useState<Country[]>([]);
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);
  const [strings, setStrings] = useState<typeof defaultStrings>(defaultStrings);

  const { user } = useUser();
  const supportedLocales = useSupportedLocales();

  const [countriesRequestId, setCountriesRequestId] = useState<string>('');
  const countriesResponse = useAppSelector(selectCountries(countriesRequestId));

  const [timeZonesRequestId, setTimeZonesRequestId] = useState<string>('');
  const timeZoneResponse = useAppSelector(selectTimezones(timeZonesRequestId));

  useEffect(() => {
    if (user) {
      setSelectedLocale(user.locale || 'en');
    }
  }, [user, setSelectedLocale]);

  useEffect(() => {
    if (selectedLocale) {
      HttpService.setDefaultHeaders({ 'Accept-Language': selectedLocale });
      const countriesDispatched = dispatch(requestListCountries());
      const timezoneDispatched = dispatch(requestListTimezones());
      setCountriesRequestId(countriesDispatched.requestId);
      setTimeZonesRequestId(timezoneDispatched.requestId);
    }
  }, [dispatch, selectedLocale]);

  useEffect(() => {
    if (selectedLocale && countriesResponse && countriesResponse.status === 'success' && countriesResponse.data) {
      const countriesCopy = [...countriesResponse.data];
      setCountries(countriesCopy.sort((a, b) => a.name.localeCompare(b.name, selectedLocale)));
    }
  }, [selectedLocale, countriesResponse]);

  useEffect(() => {
    if (selectedLocale && timeZoneResponse && timeZoneResponse.status === 'success' && timeZoneResponse.data) {
      const timezonesCopy = [...timeZoneResponse.data];
      setTimeZones(timezonesCopy.sort((a, b) => a.longName.localeCompare(b.longName, selectedLocale)));
    }
  }, [selectedLocale, timeZoneResponse]);

  useEffect(() => {
    if (selectedLocale) {
      const fetchStrings = async () => {
        const language = selectedLocale.replace(/[-_].*/, ''); // 'en-US' => 'en'
        const localeDetails =
          supportedLocales.find((details) => details.id === selectedLocale) ||
          supportedLocales.find((details) => details.id === language) ||
          supportedLocales[0];

        const localeMap: ILocalizedStringsMap = {};
        localeMap[selectedLocale] = (await localeDetails.loadModule()).strings;
        defaultStrings.setContent(localeMap);
        defaultStrings.setLanguage(selectedLocale);
        const localizedStrings = new LocalizedStrings(localeMap);

        setActiveLocale(selectedLocale);
        setStrings(localizedStrings);
      };

      void fetchStrings();
    }
  }, [selectedLocale, setActiveLocale, supportedLocales]);

  if (selectedLocale) {
    const context: ProvidedLocalizationData = {
      activeLocale,
      countries,
      bootstrapped: !!activeLocale,
      selectedLocale,
      setSelectedLocale,
      strings,
      supportedTimeZones: timeZones,
    };

    return <LocalizationContext.Provider value={context}>{children}</LocalizationContext.Provider>;
  } else {
    return null;
  }
}
