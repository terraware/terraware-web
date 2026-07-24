import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import LocalizedStrings from 'react-localization';

import { skipToken } from '@reduxjs/toolkit/query';

import { baseApi } from 'src/queries/baseApi';
import { useListTimeZoneNamesQuery } from 'src/queries/generated/timeZones';
import { setQueryLocale } from 'src/queries/locale';
import { useListCountriesQuery } from 'src/queries/search/countries';
import { useAppDispatch } from 'src/redux/store';
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
  const [strings, setStrings] = useState<typeof defaultStrings>(defaultStrings);

  const { user } = useUser();
  const supportedLocales = useSupportedLocales();
  const dispatch = useAppDispatch();
  const previousLocaleRef = useRef<string | null>(null);

  // Keep the locale that RTK Query sends as Accept-Language in sync synchronously (before the query
  // hooks below run) so the initial fetch is already localized.
  setQueryLocale(selectedLocale ?? undefined);

  const { currentData: countriesData } = useListCountriesQuery(selectedLocale ? undefined : skipToken);
  const { currentData: timeZonesData } = useListTimeZoneNamesQuery(selectedLocale ? undefined : skipToken);

  const countries = useMemo<Country[]>(() => {
    if (!selectedLocale || !countriesData) {
      return [];
    }
    return [...countriesData].sort((a, b) => a.name.localeCompare(b.name, selectedLocale));
  }, [selectedLocale, countriesData]);

  const timeZones = useMemo<TimeZoneDescription[]>(() => {
    if (!selectedLocale || !timeZonesData) {
      return [];
    }
    return [...timeZonesData.timeZones].sort((a, b) => a.longName.localeCompare(b.longName, selectedLocale));
  }, [selectedLocale, timeZonesData]);

  useEffect(() => {
    if (user) {
      setSelectedLocale(user.locale || 'en');
    }
  }, [user, setSelectedLocale]);

  useEffect(() => {
    if (selectedLocale) {
      HttpService.setDefaultHeaders({ 'Accept-Language': selectedLocale });

      // On an actual language change (not the initial load), reset the RTK Query cache so every
      // endpoint refetches with the new locale. RTK Query hooks only resubscribe when their arg
      // changes, so this is how locale-dependent data is refreshed without threading the locale
      // into each endpoint's arguments.
      if (previousLocaleRef.current !== null && previousLocaleRef.current !== selectedLocale) {
        dispatch(baseApi.util.resetApiState());
      }
      previousLocaleRef.current = selectedLocale;
    }
  }, [dispatch, selectedLocale]);

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
