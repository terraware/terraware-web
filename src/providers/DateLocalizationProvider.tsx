import React, { ReactNode } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enUS, esES, frFR } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';

import { useLocalization } from 'src/providers/hooks';

const DateLocalizationProvider = ({ children }: { children: ReactNode }) => {
  const { activeLocale } = useLocalization();
  const language = activeLocale?.replace(/[-_].*/, '');
  const adapterLocale = language === 'es' ? 'es' : language === 'fr' || language === 'gx' ? 'fr' : 'en';
  const localeText = { en: enUS, es: esES, fr: frFR }[adapterLocale].components.MuiLocalizationProvider.defaultProps
    .localeText;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale} localeText={localeText}>
      {children}
    </LocalizationProvider>
  );
};

export default DateLocalizationProvider;
