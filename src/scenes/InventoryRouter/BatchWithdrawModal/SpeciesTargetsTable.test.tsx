import React from 'react';

import { screen } from '@testing-library/react';

import { useLocalization } from 'src/providers';
import { LocalizationContext } from 'src/providers/contexts';
import { renderWithProviders } from 'src/test-utils';

import SpeciesTargetsTable from './SpeciesTargetsTable';

const rows = [
  { speciesId: 1, scientificName: 'Acacia koa', target: 12345, alreadyWithdrawn: 23456, notYetWithdrawn: 34567 },
];
const Targets = ({ locale }: { locale: string }) => {
  const localization = useLocalization();
  return (
    <LocalizationContext.Provider value={{ ...localization, activeLocale: locale }}>
      <SpeciesTargetsTable rows={rows} />
    </LocalizationContext.Provider>
  );
};

it('updates quantities when the application language changes', () => {
  const { rerender } = renderWithProviders(<Targets locale='en' />);
  for (const [locale, numbers] of [
    ['en', ['12,345', '23,456', '34,567']],
    ['es', ['12.345', '23.456', '34.567']],
    ['fr', ['12\u202f345', '23\u202f456', '34\u202f567']],
  ] as const) {
    rerender(<Targets locale={locale} />);
    for (const formattedNumber of numbers) {
      expect(screen.getByText(formattedNumber, { normalizer: (text) => text })).toBeVisible();
    }
    expect(screen.getByText('Acacia koa')).toBeVisible();
  }
});
