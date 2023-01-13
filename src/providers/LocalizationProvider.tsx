import React, { useEffect, useState } from 'react';
import { LocalizationContext } from './contexts';
import { getTimeZones } from 'src/api/timezones/timezones';
import { TimeZoneDescription } from 'src/types/TimeZones';
import strings, { ILocalizedStringsMap } from 'src/strings';
import { ProvidedLocalizationData } from '.';
import { supportedLocales } from '../strings/locales';

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
      const language = locale.replace(/[-_].*/, '');  // 'en-US' => 'en'
      const localeDetails =
        supportedLocales.find((details) => details.id === locale) ||
        supportedLocales.find((details) => details.id === language) ||
        supportedLocales[0];

      const localeMap: ILocalizedStringsMap = {};
      localeMap[locale] = (await localeDetails.loadModule()).strings;
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
