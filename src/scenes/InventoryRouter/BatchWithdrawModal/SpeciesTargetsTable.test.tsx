import React from 'react';

import { screen } from '@testing-library/react';

import { useLocalization } from 'src/providers';
import { LocalizationContext } from 'src/providers/contexts';
import { SpeciesTargetForSubstratum } from 'src/queries/search/speciesTargetsForSubstratum';
import strings from 'src/strings';
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

const KOA = 'Acacia koa';
const OHIA = 'Metrosideros polymorpha';

const buildRow = (overrides: Partial<SpeciesTargetForSubstratum> = {}): SpeciesTargetForSubstratum => ({
  speciesId: 1,
  scientificName: KOA,
  target: 1200,
  alreadyWithdrawn: 500,
  notYetWithdrawn: 700,
  ...overrides,
});

/**
 * A species' row, found by its scientific name. The table is a grid of `Box`es rather than a real
 * table, so the rows have no row role to query by; the name's parent is the only handle on one.
 */
const targetsRow = (scientificName: string): HTMLElement =>
  screen.getByText(scientificName, { exact: false }).parentElement as HTMLElement;

/** A row's three numbers, left to right: target, already withdrawn, not yet withdrawn. */
const quantitiesIn = (row: HTMLElement): string[] =>
  Array.from(row.querySelectorAll('p'))
    .map((element) => element.textContent ?? '')
    .filter((text) => /^\d/.test(text));

describe('SpeciesTargetsTable', () => {
  it('shows the target and the withdrawals against it for each species', () => {
    renderWithProviders(
      <SpeciesTargetsTable
        rows={[
          buildRow(),
          buildRow({ speciesId: 2, scientificName: OHIA, target: 3400, alreadyWithdrawn: 800, notYetWithdrawn: 2600 }),
        ]}
      />
    );

    expect(quantitiesIn(targetsRow(KOA))).toEqual(['1,200', '500', '700']);
    expect(quantitiesIn(targetsRow(OHIA))).toEqual(['3,400', '800', '2,600']);
  });

  it('says which species the targets are for', () => {
    renderWithProviders(<SpeciesTargetsTable rows={[buildRow()]} />);

    expect(screen.getByText(strings.SPECIES_WITH_TARGETS_IN_SEASON_DESCRIPTION)).toBeInTheDocument();
    for (const heading of [strings.SPECIES, strings.TARGET, strings.ALREADY_WITHDRAWN, strings.NOT_YET_WITHDRAWN]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });

  it('names a species by its common name as well, when it has one', () => {
    renderWithProviders(<SpeciesTargetsTable rows={[buildRow({ commonName: 'Koa' })]} />);

    expect(screen.getByText(`${KOA} (Koa)`)).toBeInTheDocument();
  });

  it('shows no empty parentheses for a species with no common name', () => {
    renderWithProviders(<SpeciesTargetsTable rows={[buildRow()]} />);

    expect(screen.getByText(KOA)).toBeInTheDocument();
    expect(screen.queryByText(`${KOA} ()`)).not.toBeInTheDocument();
  });

  it('reports a fully withdrawn target as zero left rather than as blank', () => {
    renderWithProviders(<SpeciesTargetsTable rows={[buildRow({ alreadyWithdrawn: 1200, notYetWithdrawn: 0 })]} />);

    expect(quantitiesIn(targetsRow(KOA))).toEqual(['1,200', '1,200', '0']);
  });

  it('shows nothing at all when the substratum has no species targets', () => {
    renderWithProviders(<SpeciesTargetsTable rows={[]} />);

    // An empty table with headings would read as "there are targets", which is the opposite.
    expect(screen.queryByText(strings.SPECIES_WITH_TARGETS_IN_SEASON_DESCRIPTION)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.TARGET)).not.toBeInTheDocument();
  });
});
