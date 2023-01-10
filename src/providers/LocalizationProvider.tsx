import React, { useEffect, useState } from 'react';
import { LocalizationContext } from './contexts';
import { getTimeZones } from 'src/api/timezones/timezones';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { stringsMap } from 'src/strings';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
  locale: string;
};

export default function LocalizationProvider({ children, locale }: LocalizationProviderProps): JSX.Element {
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

  return (
    <LocalizationContext.Provider
      value={{
        supportedTimeZones: timeZones,
        strings: stringsMap[locale],
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}
