import React, { useEffect, useState } from 'react';

import { HttpService, LocationService } from 'src/services';
import strings, { ILocalizedStringsMap } from 'src/strings';
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
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);
  const { user } = useUser();
  const supportedLocales = useSupportedLocales();

  useEffect(() => {
    if (user?.locale) {
      setSelectedLocale(user.locale);
    }
  }, [user?.locale, setSelectedLocale]);

  useEffect(() => {
    HttpService.setDefaultHeaders({ 'Accept-Language': selectedLocale });
  }, [selectedLocale]);

  // This must come after the effect that configures the Accept-Language header.
  useEffect(() => {
    const fetchTimeZones = async () => {
      const timeZoneResponse = await LocationService.getTimeZones();
      if (!timeZoneResponse.error && timeZoneResponse.timeZones) {
        setTimeZones(timeZoneResponse.timeZones.sort((a, b) => a.longName.localeCompare(b.longName, selectedLocale)));
      }
    };

    fetchTimeZones();
  }, [selectedLocale]);

  useEffect(() => {
    // Switch locales on the cookie consent UI, if enabled. This is an undocumented internal API of
    // the cookie-script.com code, so it might stop working in future versions.
    const func = (window as any).CookieScript?.instance?.applyTranslationByCode;
    if (typeof func === 'function') {
      try {
        func(selectedLocale);
      } catch (e) {
        // Swallow it rather than surfacing an error to the user.
      }
    }
  }, [selectedLocale]);

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
    bootstrapped: !!activeLocale,
    selectedLocale,
    setSelectedLocale,
    supportedTimeZones: timeZones,
  };

  return <LocalizationContext.Provider value={context}>{children}</LocalizationContext.Provider>;
}
