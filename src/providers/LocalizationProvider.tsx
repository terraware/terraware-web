import React, { useEffect, useState } from 'react';
import { LocalizationContext } from './contexts';
import { getTimeZones } from 'src/api/timezones/timezones';
import { TimeZoneDescription } from 'src/types/TimeZones';
import strings, { ILocalizedStrings, ILocalizedStringsMap } from 'src/strings';
import { ProvidedLocalizationData } from '.';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
  locale: string;
  setLocale: (locale: string) => void;
  loadedStringsForLocale: string | null;
  setLoadedStringsForLocale: (locale: string) => void;
};

export default function LocalizationProvider({
  children,
  locale,
  setLocale,
  loadedStringsForLocale,
  setLoadedStringsForLocale,
}: LocalizationProviderProps): JSX.Element | null {
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);

  useEffect(() => {
    const fetchTimeZones = async () => {
      const timeZoneResponse = await getTimeZones(locale);
      if (!timeZoneResponse.error && timeZoneResponse.timeZones) {
        setTimeZones(timeZoneResponse.timeZones.sort((a, b) => a.longName.localeCompare(b.longName, locale)));
      }
    };

    fetchTimeZones();
  }, [locale]);

  useEffect(() => {
    const fetchStrings = async () => {
      let stringsModule: Promise<{ strings: ILocalizedStrings }>;

      // These dynamic imports will cause Webpack to generate a separate chunk file for each
      // locale's strings.
      //
      // This is hardwired to English initially, but as we add locales, they'll be conditionally
      // imported here.
      stringsModule = import('../strings/strings-en');

      const stringsTable = (await stringsModule).strings;

      const localeMap: ILocalizedStringsMap = {};
      localeMap[locale] = stringsTable;
      strings.setContent(localeMap);
      strings.setLanguage(locale);

      setLoadedStringsForLocale(locale);
    };

    fetchStrings();
  }, [locale, setLoadedStringsForLocale]);

  const context: ProvidedLocalizationData = {
    bootstrapped: !!loadedStringsForLocale,
    locale,
    setLocale,
    loadedStringsForLocale,
    supportedTimeZones: timeZones,
  };

  return <LocalizationContext.Provider value={context}>{children}</LocalizationContext.Provider>;
}
