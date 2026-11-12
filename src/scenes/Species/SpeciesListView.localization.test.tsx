import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';

import { LocalizationContext } from 'src/providers/contexts';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { buildSpecies, buildUser, mockGet, renderWithProviders } from 'src/test-utils';
import { setTestLocale } from 'src/test-utils/setupStrings';

import SpeciesListView from './SpeciesListView';

const tableLocalization = () =>
  strings.getLanguage() === 'es'
    ? MRT_Localization_ES
    : strings.getLanguage() === 'fr'
      ? MRT_Localization_FR
      : MRT_Localization_EN;

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
  localStorage.removeItem('species-list-table-currentView');
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
        conservationCategory: 'EN',
        rare: true,
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
  localStorage.removeItem('species-list-table-currentView');
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
    ['CONSERVATION_CATEGORY', 'IUCN_ENDANGERED'],
    ['RARE', 'YES'],
  ] as const)('filters by the translated %s value', async (columnKey, valueKey) => {
    const { user } = renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'es', selectedLocale: 'es' },
    });
    await screen.findByRole('link', { name: 'Acacia koa' });

    await user.click(screen.getByRole('button', { name: tableLocalization().showHideFilters }));
    await user.click(screen.getByRole('combobox', { name: new RegExp(strings[columnKey]) }));
    await user.click(await screen.findByRole('option', { name: strings[valueKey] }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('link', { name: 'Acacia koa' })).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Dryopteris filix-mas' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Unknown species' })).not.toBeInTheDocument();
    });
  });

  it.each([
    ['growthForms', ['Tree']],
    ['seedStorageBehavior', 'Orthodox'],
    ['ecosystemTypes', ['Mangroves']],
    ['conservationCategory', 'EN'],
    ['rare', 'Yes'],
  ])('restores an existing %s filter in a different language', async (id, value) => {
    localStorage.setItem('species-list-table_columnFilters', JSON.stringify([{ id, value }]));
    renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'es', selectedLocale: 'es' },
    });

    expect(await screen.findByRole('link', { name: 'Acacia koa' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Dryopteris filix-mas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Unknown species' })).not.toBeInTheDocument();
  });

  it.each([
    ['growthForms', ['Árbol']],
    ['seedStorageBehavior', 'Ortodoxo'],
    ['ecosystemTypes', ['Manglares']],
    ['conservationCategory', 'Endangered (EN)'],
    ['rare', 'Oui'],
    ['rare', 'Sí'],
    ['status', 'Nativo'],
  ])('discards an invalid saved %s filter', async (id, value) => {
    localStorage.setItem('species-list-table_columnFilters', JSON.stringify([{ id, value }]));
    renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'es', selectedLocale: 'es' },
    });

    expect(await screen.findByRole('link', { name: 'Acacia koa' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Dryopteris filix-mas' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Unknown species' })).toBeVisible();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('species-list-table_columnFilters') ?? '[]')).toEqual([])
    );
  });

  it.each([
    ['GROWTH_FORM', 'TREE'],
    ['SEED_STORAGE_BEHAVIOR', 'ORTHODOX'],
    ['ECOSYSTEM_TYPE', 'ECOSYSTEM_MANGROVE'],
    ['CONSERVATION_CATEGORY', 'IUCN_ENDANGERED'],
    ['RARE', 'YES'],
  ] as const)('keeps a selected %s filter when switching languages', async (columnKey, valueKey) => {
    const { user, rerender } = renderWithProviders(<LocalizedSpeciesList locale='en' />);
    await screen.findByRole('link', { name: 'Acacia koa' });
    await user.click(screen.getByRole('button', { name: tableLocalization().showHideFilters }));
    await user.click(screen.getByRole('combobox', { name: new RegExp(strings[columnKey]) }));
    await user.click(await screen.findByRole('option', { name: strings[valueKey] }));
    await user.keyboard('{Escape}');

    for (const locale of ['es', 'fr']) {
      setTestLocale(locale);
      rerender(<LocalizedSpeciesList locale={locale} />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Acacia koa' })).toBeVisible();
        expect(screen.getByRole('cell', { name: strings[valueKey] })).toBeVisible();
        expect(screen.queryByRole('link', { name: 'Dryopteris filix-mas' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Unknown species' })).not.toBeInTheDocument();
      });
      expect(screen.getByRole('combobox', { name: new RegExp(strings[columnKey]) })).toHaveTextContent(
        strings[valueKey]
      );
    }
  });

  it.each([
    ['GROWTH_FORM', 'TREE'],
    ['ECOSYSTEM_TYPE', 'ECOSYSTEM_MANGROVE'],
  ] as const)('shows all species after deselecting the last %s filter option', async (columnKey, valueKey) => {
    const { user } = renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'es', selectedLocale: 'es' },
    });
    await screen.findByRole('link', { name: 'Acacia koa' });
    await user.click(screen.getByRole('button', { name: tableLocalization().showHideFilters }));
    await user.click(screen.getByRole('combobox', { name: new RegExp(strings[columnKey]) }));
    const option = await screen.findByRole('option', { name: strings[valueKey] });
    await user.click(option);
    await user.click(option);
    await user.keyboard('{Escape}');

    expect(screen.getByRole('link', { name: 'Acacia koa' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Dryopteris filix-mas' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Unknown species' })).toBeVisible();
  });

  it('restores valid filters from a saved view and discards invalid ones', async () => {
    const view = {
      id: 42,
      name: 'Trees in mangroves',
      baseView: 'default',
      tableName: 'species',
      settings: {
        columnFilters: [
          { id: 'growthForms', value: ['Tree'] },
          { id: 'seedStorageBehavior', value: 'Orthodox' },
          { id: 'ecosystemTypes', value: ['Mangroves'] },
          { id: 'conservationCategory', value: 'En danger (EN)' },
          { id: 'rare', value: 'Sí' },
        ],
      },
    };
    localStorage.setItem('species-list-table-currentView', JSON.stringify({ savedViewId: '42' }));
    mockGet('/api/v1/users/me/savedTableViews', { views: [view] });
    renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'fr', selectedLocale: 'fr' },
    });

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) })).toHaveTextContent(view.name);
      expect(screen.getByRole('link', { name: 'Acacia koa' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Dryopteris filix-mas' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Unknown species' })).not.toBeInTheDocument();
    });
    expect(JSON.parse(localStorage.getItem('species-list-table_columnFilters') ?? '[]')).toEqual([
      { id: 'growthForms', value: ['Tree'] },
      { id: 'seedStorageBehavior', value: 'Orthodox' },
      { id: 'ecosystemTypes', value: ['Mangroves'] },
    ]);
  });

  it('keeps missing seed storage behavior after populated values when sorted ascending', async () => {
    const { user } = renderWithProviders(<SpeciesListView />);
    await screen.findByRole('link', { name: 'Acacia koa' });

    await user.click(screen.getByText(strings.SEED_STORAGE_BEHAVIOR));
    expect(screen.getByRole('columnheader', { name: new RegExp(strings.SEED_STORAGE_BEHAVIOR) })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    await waitFor(() => {
      expect(
        screen
          .getAllByRole('link', { name: /Acacia koa|Dryopteris filix-mas|Unknown species/ })
          .map((link) => link.textContent)
      ).toEqual(['Acacia koa', 'Dryopteris filix-mas', 'Unknown species']);
    });
  });

  it('keeps commas inside a single translated ecosystem label', async () => {
    mockGet('/api/v1/species', {
      species: [buildSpecies({ ecosystemTypes: ['Temperate grasslands, savannas and shrublands'] })],
    });
    renderWithProviders(<SpeciesListView />, {
      localization: { activeLocale: 'fr', selectedLocale: 'fr' },
    });

    expect(
      await screen.findByRole('cell', { name: strings.ECOSYSTEM_TEMPERATE_GRASSLAND_SAVANNA_SHRUBLAND })
    ).toBeVisible();
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
