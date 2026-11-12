import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import LocalizedStrings from 'react-localization';

import { getStrings as getComponentStrings, setLocale as setComponentLocale } from '@terraware/web-components';

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

  const { currentData: countriesData } = useListCountriesQuery();
  const { currentData: timeZonesData } = useListTimeZoneNamesQuery(undefined);

  const countries = useMemo<Country[]>(() => {
    if (!countriesData) {
      return [];
    }
    return [...countriesData].sort((a, b) => a.name.localeCompare(b.name, selectedLocale ?? 'en'));
  }, [selectedLocale, countriesData]);

  const timeZones = useMemo<TimeZoneDescription[]>(() => {
    if (!timeZonesData) {
      return [];
    }
    return [...timeZonesData.timeZones].sort((a, b) => a.longName.localeCompare(b.longName, selectedLocale ?? 'en'));
  }, [selectedLocale, timeZonesData]);

  // Follow the user's saved locale only when it changes. After a language switch, the user is
  // refetched and can still carry the previous locale until the profile update lands; reapplying it
  // would flip the app back to the old language.
  const userLocale = user ? user.locale || 'en' : undefined;
  const lastUserLocaleRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (userLocale && userLocale !== lastUserLocaleRef.current) {
      lastUserLocaleRef.current = userLocale;
      setSelectedLocale(userLocale);
    }
  }, [userLocale, setSelectedLocale]);

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
      // A quick switch to another locale can finish loading before this one does; don't let this one
      // overwrite it.
      let cancelled = false;

      const fetchStrings = async () => {
        const language = selectedLocale.replace(/[-_].*/, ''); // 'en-US' => 'en'
        const localeDetails =
          supportedLocales.find((details) => details.id === selectedLocale) ||
          supportedLocales.find((details) => details.id === language) ||
          supportedLocales[0];

        // The component library keeps its own string tables, and owning the locale is the
        // application's job. Switch it here so the components change language at the same moment
        // the app does, and before reading the table below.
        setComponentLocale(selectedLocale);

        // The component library's table is the base layer: this application's strings are laid over
        // it so a single lookup reaches either. The type check rejects keys defined in both, so
        // nothing is being shadowed here.
        const localeMap: ILocalizedStringsMap = {
          [selectedLocale]: { ...getComponentStrings(), ...(await localeDetails.loadModule()).strings },
        };
        if (cancelled) {
          return;
        }
        defaultStrings.setContent(localeMap);
        defaultStrings.setLanguage(selectedLocale);
        const localizedStrings = new LocalizedStrings(localeMap);

        setActiveLocale(selectedLocale);
        setStrings(localizedStrings);
      };

      void fetchStrings();

      return () => {
        cancelled = true;
      };
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
