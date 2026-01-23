import React, { type JSX, useEffect, useState } from 'react';

import { Box, SxProps } from '@mui/material';

import { useLocalization } from 'src/providers';
import { useUserTimeZone } from 'src/utils/useTimeZoneUtils';

export interface TimestampProps {
  className?: string;
  /** String representation of timestamp in ISO-8601 YYYY-MM-DDThh:mm:ssZ form. */
  isoString: string;
  sx?: SxProps;
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
export default function Timestamp({ className, isoString, sx }: TimestampProps): JSX.Element | null {
  const timeZone = useUserTimeZone()?.id;
  const { selectedLocale } = useLocalization();
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(newDateTimeFormat(selectedLocale, timeZone).format(new Date(isoString)));
  }, [isoString, selectedLocale, timeZone, setFormattedDate]);

  return (
    <Box component='span' className={className} sx={sx}>
      {formattedDate}
    </Box>
  );
}
