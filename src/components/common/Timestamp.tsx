import { useLocalization } from 'src/providers';
import { useUserTimeZone } from 'src/utils/useTimeZoneUtils';
import { useEffect, useState } from 'react';

export interface TimestampProps {
  className?: string;
  /** String representation of timestamp in ISO-8601 YYYY-MM-DDThh:mm:ssZ form. */
  isoString: string;
}

/** Returns a DateTimeFormat object for a locale and time zone. */
function newDateTimeFormat(locale?: string, timeZone?: string) {
  const localeToUse = locale === 'gx' ? 'fr' : locale || 'en';
  return new Intl.DateTimeFormat(localeToUse, {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone,
  });
}

/** Renders a timestamp using the current locale and the user's time zone. */
export default function Timestamp({ className, isoString }: TimestampProps): JSX.Element | null {
  const timeZone = useUserTimeZone()?.id;
  const { locale } = useLocalization();
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(newDateTimeFormat(locale, timeZone).format(new Date(isoString)));
  }, [isoString, locale, timeZone, setFormattedDate]);

  return <span className={className}>{formattedDate}</span>;
}
