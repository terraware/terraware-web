import React, { useEffect, useState } from 'react';

import { requestListCountries, requestListTimezones } from 'src/redux/features/location/locationAsyncThunks';
import { selectCountries, selectTimezones } from 'src/redux/features/location/locationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { HttpService } from 'src/services';
import strings, { ILocalizedStringsMap } from 'src/strings';
import { Country } from 'src/types/Country';
import { TimeZoneDescription } from 'src/types/TimeZones';

import { ProvidedLocalizationData, useUser } from '.';
import { useSupportedLocales } from '../strings/locales';
import { LocalizationContext } from './contexts';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
  selectedLocale: string;
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

  const { user } = useUser();
  const supportedLocales = useSupportedLocales();

  const [countriesRequestId, setCountriesRequestId] = useState<string>('');
  const countriesResponse = useAppSelector(selectCountries(countriesRequestId));

  const [timeZonesRequestId, setTimeZonesRequestId] = useState<string>('');
  const timeZoneResponse = useAppSelector(selectTimezones(timeZonesRequestId));

  useEffect(() => {
    if (user?.locale) {
      setSelectedLocale(user.locale);
    }
  }, [user?.locale, setSelectedLocale]);

  useEffect(() => {
    HttpService.setDefaultHeaders({ 'Accept-Language': selectedLocale });
    const countriesDispatched = dispatch(requestListCountries());
    const timezoneDispatched = dispatch(requestListTimezones());
    setCountriesRequestId(countriesDispatched.requestId);
    setTimeZonesRequestId(timezoneDispatched.requestId);
  }, [dispatch, selectedLocale]);

  useEffect(() => {
    if (countriesResponse && countriesResponse.status === 'success' && countriesResponse.data) {
      setCountries(countriesResponse.data.sort((a, b) => a.name.localeCompare(b.name, selectedLocale)));
    }
  }, [selectedLocale, countriesResponse]);

  useEffect(() => {
    if (timeZoneResponse && timeZoneResponse.status === 'success' && timeZoneResponse.data) {
      setTimeZones(timeZoneResponse.data.sort((a, b) => a.longName.localeCompare(b.longName, selectedLocale)));
    }
  }, [selectedLocale, timeZoneResponse]);

  useEffect(() => {
    const fetchStrings = async () => {
      const language = selectedLocale.replace(/[-_].*/, ''); // 'en-US' => 'en'
      const localeDetails =
        supportedLocales.find((details) => details.id === selectedLocale) ||
        supportedLocales.find((details) => details.id === language) ||
        supportedLocales[0];

      const localeMap: ILocalizedStringsMap = {};
      localeMap[selectedLocale] = (await localeDetails.loadModule()).strings;
      strings.setContent(localeMap);
      strings.setLanguage(selectedLocale);

      setActiveLocale(selectedLocale);
    };

    fetchStrings();
  }, [selectedLocale, setActiveLocale, supportedLocales]);

  const context: ProvidedLocalizationData = {
    activeLocale,
    countries,
    bootstrapped: !!activeLocale,
    selectedLocale,
    setSelectedLocale,
    supportedTimeZones: timeZones,
  };

  return <LocalizationContext.Provider value={context}>{children}</LocalizationContext.Provider>;
}
