import React from 'react';

import { DateCalendar } from '@mui/x-date-pickers';
import { screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { LocalizationContext } from 'src/providers/contexts';
import { useLocalization } from 'src/providers/hooks';
import { renderWithProviders } from 'src/test-utils';

import DateLocalizationProvider from './DateLocalizationProvider';

const Calendar = ({ locale }: { locale: string }) => {
  const localization = useLocalization();
  return (
    <LocalizationContext.Provider value={{ ...localization, activeLocale: locale }}>
      <DateLocalizationProvider>
        <DateCalendar defaultValue={dayjs('2026-02-15')} />
      </DateLocalizationProvider>
    </LocalizationContext.Provider>
  );
};

it('updates month names, calendar controls, and week starts without losing the date', () => {
  const { rerender } = renderWithProviders(<Calendar locale='en' />);
  for (const [locale, month, previousMonth, firstWeekday] of [
    ['en', 'February 2026', 'Previous month', 'Sunday'],
    ['es', 'febrero 2026', 'Mes anterior', 'lunes'],
    ['fr', 'février 2026', 'Mois précédent', 'lundi'],
  ]) {
    rerender(<Calendar locale={locale} />);
    expect(screen.getByText(month)).toBeVisible();
    expect(screen.getByRole('button', { name: previousMonth })).toBeVisible();
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-label', firstWeekday);
    expect(screen.getByRole('gridcell', { name: '15', selected: true })).toBeVisible();
  }
});

it.each([
  ['es-MX', 'febrero 2026'],
  ['gx', 'février 2026'],
  ['unknown', 'February 2026'],
])('handles the %s locale', (locale, month) => {
  renderWithProviders(<Calendar locale={locale} />);
  expect(screen.getByText(month)).toBeVisible();
});
