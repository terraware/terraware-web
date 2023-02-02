import { useLocalization } from '../../providers';
import { useUserTimeZone } from '../../utils/useTimeZoneUtils';
import { useEffect, useState } from 'react';

export interface TimestampProps {
  className?: string;
  /** String representation of timestamp in ISO-8601 YYYY-MM-DDThh:mm:ssZ form. */
  isoString: string;
}

/** Returns a DateTimeFormat object for a locale and time zone. */
function newDateTimeFormat(locale?: string, timeZone?: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone,
    hourCycle: locale === 'gx' ? 'h24' : undefined,
  });
}

/** Renders a timestamp using the current locale and the user's time zone. */
export default function Timestamp({ className, isoString }: TimestampProps): JSX.Element | null {
  const timeZone = useUserTimeZone()?.id;
  const { locale } = useLocalization();
  const [dateTimeFormat, setDateTimeFormat] = useState<Intl.DateTimeFormat>(newDateTimeFormat(locale, timeZone));

  useEffect(() => {
    setDateTimeFormat(newDateTimeFormat(locale, timeZone));
  }, [locale, timeZone, setDateTimeFormat]);

  const format = () => {
    const formatted = dateTimeFormat.format(new Date(isoString));
    if (locale === 'gx') {
      return formatted?.replace(/[A-Za-z]/g, 'XY');
    } else {
      return formatted;
    }
  };

  return <span className={className}>{format()}</span>;
}
