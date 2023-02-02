import React, { useEffect, useState } from 'react';
import { LocalizationContext } from './contexts';
import { TimeZoneDescription } from 'src/types/TimeZones';
import strings, { ILocalizedStringsMap } from 'src/strings';
import { ProvidedLocalizationData, useUser } from '.';
import { supportedLocales } from '../strings/locales';
import { HttpService, I18nService } from 'src/services';

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
  const { user } = useUser();

  useEffect(() => {
    if (user?.locale) {
      setLocale(user.locale);
    }
  }, [user?.locale, setLocale]);

  useEffect(() => {
    HttpService.setDefaultHeaders({ 'Accept-Language': locale });
  }, [locale]);

  // This must come after the effect that configures the Accept-Language header.
  useEffect(() => {
    const fetchTimeZones = async () => {
      const timeZoneResponse = await I18nService.getTimeZones();
      if (!timeZoneResponse.error && timeZoneResponse.timeZones) {
        setTimeZones(timeZoneResponse.timeZones.sort((a, b) => a.longName.localeCompare(b.longName, locale)));
      }
    };

    fetchTimeZones();
  }, [locale]);

  useEffect(() => {
    const fetchStrings = async () => {
      const language = locale.replace(/[-_].*/, ''); // 'en-US' => 'en'
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
