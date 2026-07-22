import React, { type JSX, useEffect, useState } from 'react';
import LocalizedStrings from 'react-localization';

import { skipToken } from '@reduxjs/toolkit/query';

import { useListCountriesQuery, useListTimeZonesQuery } from 'src/queries/location/localization';
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);
  const [strings, setStrings] = useState<typeof defaultStrings>(defaultStrings);

  const { user } = useUser();
  const supportedLocales = useSupportedLocales();

  const { currentData: countriesData } = useListCountriesQuery(selectedLocale ? { locale: selectedLocale } : skipToken);
  const { currentData: timeZonesData } = useListTimeZonesQuery(selectedLocale ? { locale: selectedLocale } : skipToken);

  useEffect(() => {
    if (user) {
      setSelectedLocale(user.locale || 'en');
    }
  }, [user, setSelectedLocale]);

  useEffect(() => {
    if (selectedLocale) {
      HttpService.setDefaultHeaders({ 'Accept-Language': selectedLocale });
    }
  }, [selectedLocale]);

  useEffect(() => {
    if (selectedLocale && countriesData) {
      const countriesCopy = [...countriesData];
      setCountries(countriesCopy.sort((a, b) => a.name.localeCompare(b.name, selectedLocale)));
    }
  }, [selectedLocale, countriesData]);

  useEffect(() => {
    if (selectedLocale && timeZonesData) {
      const timezonesCopy = [...timeZonesData];
      setTimeZones(timezonesCopy.sort((a, b) => a.longName.localeCompare(b.longName, selectedLocale)));
    }
  }, [selectedLocale, timeZonesData]);

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
