import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { MRT_Localization_EN } from 'material-react-table/locales/en';

import { LocalizationContext } from 'src/providers/contexts';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { buildSpecies, buildUser, mockGet, renderWithProviders } from 'src/test-utils';
import { setTestLocale } from 'src/test-utils/setupStrings';

import SpeciesListView from './SpeciesListView';

const LocalizedSpeciesList = ({ locale }: { locale: string }) => {
  const localization = useLocalization();
  return (
    <LocalizationContext.Provider value={{ ...localization, activeLocale: locale, selectedLocale: locale }}>
      <SpeciesListView />
    </LocalizationContext.Provider>
  );
};

beforeEach(() => {
  localStorage.removeItem('species-list-table_columnFilters');
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/species', {
    species: [
      buildSpecies({
        id: 1,
        scientificName: 'Acacia koa',
        growthForms: ['Tree'],
        seedStorageBehavior: 'Orthodox',
        ecosystemTypes: ['Mangroves'],
      }),
      buildSpecies({
        id: 2,
        scientificName: 'Dryopteris filix-mas',
        growthForms: ['Fern'],
        seedStorageBehavior: 'Recalcitrant',
        ecosystemTypes: ['Tundra'],
      }),
      buildSpecies({ id: 3, scientificName: 'Unknown species' }),
    ],
  });
});

afterEach(() => {
  localStorage.removeItem('species-list-table_columnFilters');
});

describe('SpeciesListView localization', () => {
  it.each(['en', 'es', 'fr'])('displays species field values in %s', async (locale) => {
    renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: locale, selectedLocale: locale },
    });

    const speciesRow = (await screen.findByRole('link', { name: 'Acacia koa' })).closest('tr')!;
    expect(within(speciesRow).getByRole('cell', { name: strings.TREE })).toBeVisible();
    expect(within(speciesRow).getByRole('cell', { name: strings.ORTHODOX })).toBeVisible();
    expect(within(speciesRow).getByRole('cell', { name: strings.ECOSYSTEM_MANGROVE })).toBeVisible();

    const unknownRow = screen.getByRole('link', { name: 'Unknown species' }).closest('tr')!;
    expect(within(unknownRow).queryByText(strings.TREE)).not.toBeInTheDocument();
    expect(within(unknownRow).queryByText(strings.ORTHODOX)).not.toBeInTheDocument();
    expect(within(unknownRow).queryByText(strings.ECOSYSTEM_MANGROVE)).not.toBeInTheDocument();
  });

  it('updates translated field values when the locale changes with the same species data', async () => {
    const { rerender } = renderWithProviders(<LocalizedSpeciesList locale='en' />);
    await screen.findByRole('link', { name: 'Acacia koa' });
    expect(screen.getByRole('cell', { name: strings.TREE })).toBeVisible();

    setTestLocale('es');
    rerender(<LocalizedSpeciesList locale='es' />);

    expect(screen.getByRole('cell', { name: strings.TREE })).toBeVisible();
    expect(screen.getByRole('cell', { name: strings.ORTHODOX })).toBeVisible();
    expect(screen.getByRole('cell', { name: strings.ECOSYSTEM_MANGROVE })).toBeVisible();
  });

  it.each([
    ['GROWTH_FORM', 'TREE'],
    ['SEED_STORAGE_BEHAVIOR', 'ORTHODOX'],
    ['ECOSYSTEM_TYPE', 'ECOSYSTEM_MANGROVE'],
  ] as const)('filters by the translated %s value', async (columnKey, valueKey) => {
    const { user } = renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'es', selectedLocale: 'es' },
    });
    await screen.findByRole('link', { name: 'Acacia koa' });

    await user.click(screen.getByRole('button', { name: MRT_Localization_EN.showHideFilters }));
    await user.click(screen.getByRole('combobox', { name: new RegExp(strings[columnKey]) }));
    await user.click(await screen.findByRole('option', { name: strings[valueKey] }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('link', { name: 'Acacia koa' })).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Dryopteris filix-mas' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Unknown species' })).not.toBeInTheDocument();
    });
  });

  it('exports translated species field values to CSV', async () => {
    const download = rstest.spyOn(URL, 'createObjectURL');
    const click = rstest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    try {
      const { user } = renderWithProviders(<SpeciesListView />, {
        localization: { activeLocale: 'fr', selectedLocale: 'fr' },
      });
      await screen.findByRole('link', { name: 'Acacia koa' });
      await user.click(screen.getByRole('button', { name: strings.EXPORT }));

      expect(download).toHaveBeenCalledTimes(1);
      const blob = download.mock.calls[0][0] as Blob;
      const csv = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });
      expect(csv).toContain(`"${strings.TREE}"`);
      expect(csv).toContain(`"${strings.ORTHODOX}"`);
      expect(csv).toContain(`"${strings.ECOSYSTEM_MANGROVE}"`);
    } finally {
      download.mockRestore();
      click.mockRestore();
    }
  });
});
