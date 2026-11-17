import React, { useState } from 'react';

import { screen, waitFor } from '@testing-library/react';

import SpeciesSummaryDrawer from 'src/scenes/NurseryRouter/PlantingSeasons/SpeciesSummaryDrawer';
import strings from 'src/strings';
import { buildSpecies, captureRequests, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

const PLANTING_SEASON_ID = 42;
const SEARCH_PATH = '/api/v1/search';

const KOA_ID = 7;
const OHIA_ID = 8;
const KOA = 'Acacia koa';
const OHIA = 'Metrosideros polymorpha';

type SearchSeason = {
  speciesTargets?: {
    species_id: string;
    species_scientificName?: string;
    species_commonName?: string;
    'quantity(raw)': string;
  }[];
  allocatedSpecies?: { species_id: string; 'quantity(raw)': string }[];
  withdrawals?: { batchWithdrawals_batch_species_id: string; 'batchWithdrawals_readyQuantityWithdrawn(raw)': string }[];
};

/** One season, in the shape `/api/v1/search` answers with for the `plantingSeasons` prefix. */
const searchResults = (season: SearchSeason) => ({
  results: [{ id: `${PLANTING_SEASON_ID}`, name: 'Winter', ...season }],
});

const target = (speciesId: number, quantity: number, names?: { scientificName?: string; commonName?: string }) => ({
  species_id: `${speciesId}`,
  species_scientificName: names?.scientificName,
  species_commonName: names?.commonName,
  'quantity(raw)': `${quantity}`,
});

const allocated = (speciesId: number, quantity: number) => ({
  species_id: `${speciesId}`,
  'quantity(raw)': `${quantity}`,
});

const withdrawal = (speciesId: number, quantity: number) => ({
  batchWithdrawals_batch_species_id: `${speciesId}`,
  'batchWithdrawals_readyQuantityWithdrawn(raw)': `${quantity}`,
});

/** Two species with distinct numbers in every column, so no assertion can match the wrong cell. */
const TWO_SPECIES = searchResults({
  speciesTargets: [target(KOA_ID, 1200), target(OHIA_ID, 3400)],
  allocatedSpecies: [allocated(KOA_ID, 900), allocated(OHIA_ID, 2100)],
  withdrawals: [withdrawal(KOA_ID, 500), withdrawal(OHIA_ID, 800)],
});

beforeEach(() => {
  mockGet('/api/v1/species', {
    species: [
      buildSpecies({ id: KOA_ID, scientificName: KOA, commonName: 'Koa' }),
      buildSpecies({ id: OHIA_ID, scientificName: OHIA, commonName: 'ʻŌhiʻa lehua' }),
    ],
  });
});

const renderDrawer = () =>
  renderWithProviders(
    <SpeciesSummaryDrawer open={true} onClose={() => undefined} plantingSeasonId={PLANTING_SEASON_ID} />
  );

/**
 * A species' row, found by its scientific name. The rows are grid `Box`es rather than a table, so
 * they carry no row role or accessible name; the name's grandparent is the only handle on one.
 * Giving the summary real table semantics would let this drop in favor of `getByRole('row')`.
 */
const speciesRow = async (scientificName: string): Promise<HTMLElement> =>
  (await screen.findByText(scientificName)).parentElement?.parentElement as HTMLElement;

const totalsRow = (): HTMLElement => screen.getByText(strings.TOTALS).parentElement as HTMLElement;

/** Reads a row's four numbers left to right: target, allocated, withdrawn, left to plant. */
const quantitiesIn = (row: HTMLElement): string[] =>
  Array.from(row.querySelectorAll('p'))
    .map((element) => element.textContent ?? '')
    .filter((text) => /^\d/.test(text));

describe('SpeciesSummaryDrawer', () => {
  it('shows what each species has targeted, allocated, withdrawn and left to plant', async () => {
    mockPost(SEARCH_PATH, TWO_SPECIES);

    renderDrawer();

    expect(quantitiesIn(await speciesRow(KOA))).toEqual(['1,200', '900', '500', '700']);
    expect(quantitiesIn(await speciesRow(OHIA))).toEqual(['3,400', '2,100', '800', '2,600']);
  });

  it('totals every column across the species', async () => {
    mockPost(SEARCH_PATH, TWO_SPECIES);

    renderDrawer();

    await speciesRow(KOA);
    expect(quantitiesIn(totalsRow())).toEqual(['4,600', '3,000', '1,300', '3,300']);
  });

  it('counts the species in the heading', async () => {
    mockPost(SEARCH_PATH, TWO_SPECIES);

    renderDrawer();

    expect(await screen.findByText(`${strings.SPECIES} (2)`)).toBeInTheDocument();
  });

  it('adds up a species targeted in more than one substratum', async () => {
    mockPost(
      SEARCH_PATH,
      searchResults({
        speciesTargets: [target(KOA_ID, 1200), target(KOA_ID, 300)],
        withdrawals: [withdrawal(KOA_ID, 100), withdrawal(KOA_ID, 250)],
      })
    );

    renderDrawer();

    // One species, not two: targets and withdrawals are summed per species.
    expect(await screen.findByText(`${strings.SPECIES} (1)`)).toBeInTheDocument();
    expect(quantitiesIn(await speciesRow(KOA))).toEqual(['1,500', '0', '350', '1,150']);
  });

  it('never reports a negative number left to plant', async () => {
    mockPost(
      SEARCH_PATH,
      searchResults({
        speciesTargets: [target(KOA_ID, 100)],
        withdrawals: [withdrawal(KOA_ID, 250)],
      })
    );

    renderDrawer();

    expect(quantitiesIn(await speciesRow(KOA))).toEqual(['100', '0', '250', '0']);
  });

  it('lists the species in alphabetical order', async () => {
    mockPost(
      SEARCH_PATH,
      searchResults({
        speciesTargets: [target(OHIA_ID, 3400), target(KOA_ID, 1200)],
      })
    );

    renderDrawer();

    await screen.findByText(KOA);
    const names = Array.from(document.querySelectorAll('p')).map((element) => element.textContent);
    expect(names.indexOf(KOA)).toBeLessThan(names.indexOf(OHIA));
  });

  it('names a species from the organization rather than from the summary', async () => {
    mockPost(
      SEARCH_PATH,
      searchResults({
        speciesTargets: [target(KOA_ID, 1200, { scientificName: 'Stale name', commonName: 'Stale common name' })],
      })
    );

    renderDrawer();

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    expect(screen.getByText('Koa')).toBeInTheDocument();
    expect(screen.queryByText('Stale name')).not.toBeInTheDocument();
  });

  it('falls back to the summary name for a species the organization no longer has', async () => {
    mockPost(
      SEARCH_PATH,
      searchResults({
        speciesTargets: [target(99, 1200, { scientificName: 'Santalum paniculatum' })],
      })
    );

    renderDrawer();

    expect(await screen.findByText('Santalum paniculatum')).toBeInTheDocument();
  });

  it('falls back to the species id when nothing names the species', async () => {
    mockPost(SEARCH_PATH, searchResults({ allocatedSpecies: [allocated(99, 500)] }));

    renderDrawer();

    expect(await screen.findByText('#99')).toBeInTheDocument();
  });

  it('shows zero totals for a season with nothing planned', async () => {
    mockPost(SEARCH_PATH, { results: [] });

    renderDrawer();

    expect(await screen.findByText(`${strings.SPECIES} (0)`)).toBeInTheDocument();
    expect(quantitiesIn(totalsRow())).toEqual(['0', '0', '0', '0']);
  });

  it('groups the quantities for the language the application is in', async () => {
    mockPost(SEARCH_PATH, TWO_SPECIES);

    renderWithProviders(
      <SpeciesSummaryDrawer open={true} onClose={() => undefined} plantingSeasonId={PLANTING_SEASON_ID} />,
      { localization: { activeLocale: 'fr', selectedLocale: 'fr' } }
    );

    // French groups thousands with a narrow no-break space.
    expect(quantitiesIn(await speciesRow(KOA))).toEqual(['1\u202f200', '900', '500', '700']);
    expect(quantitiesIn(totalsRow())).toEqual(['4\u202f600', '3\u202f000', '1\u202f300', '3\u202f300']);
  });

  it('asks the server for the summary of the season it was given', async () => {
    const requests = captureRequests('post', SEARCH_PATH, TWO_SPECIES);

    renderDrawer();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      prefix: 'plantingSeasons',
      search: { operation: 'field', field: 'id', type: 'Exact', values: [`${PLANTING_SEASON_ID}`] },
    });
  });
});

describe('SpeciesSummaryDrawer opening and closing', () => {
  const OPEN_SUMMARY = 'Open summary';

  const DrawerHost = (): React.JSX.Element => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>{OPEN_SUMMARY}</button>
        <SpeciesSummaryDrawer open={open} onClose={() => setOpen(false)} plantingSeasonId={PLANTING_SEASON_ID} />
      </>
    );
  };

  it('asks for nothing until it is opened', async () => {
    const searches = captureRequests('post', SEARCH_PATH, TWO_SPECIES);
    const speciesRequests = captureRequests('get', '/api/v1/species', { species: [] });

    const { user } = renderWithProviders(<DrawerHost />);

    // The species list loads with the host; waiting on it proves the mount's effects have run.
    await waitFor(() => expect(speciesRequests).toHaveLength(1));
    expect(searches).toHaveLength(0);
    expect(screen.queryByText(strings.SPECIES_SUMMARY)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: OPEN_SUMMARY }));

    await waitFor(() => expect(searches).toHaveLength(1));
    expect(screen.getByText(strings.SPECIES_SUMMARY)).toBeInTheDocument();
  });

  it('closes from the Close button', async () => {
    mockPost(SEARCH_PATH, TWO_SPECIES);

    const { user } = renderWithProviders(<DrawerHost />);

    await user.click(screen.getByRole('button', { name: OPEN_SUMMARY }));
    await screen.findByText(KOA);
    await user.click(screen.getByRole('button', { name: strings.CLOSE }));

    await waitFor(() => expect(screen.queryByText(KOA)).not.toBeInTheDocument());
  });

  it('closes from the corner icon', async () => {
    mockPost(SEARCH_PATH, TWO_SPECIES);

    const { user } = renderWithProviders(<DrawerHost />);

    await user.click(screen.getByRole('button', { name: OPEN_SUMMARY }));
    await screen.findByText(KOA);
    // The icon's `aria-label` is a hardcoded lowercase literal rather than a localized string, so
    // it can't be matched through `strings`. Localizing it would let this read `strings.CLOSE`.
    await user.click(screen.getByRole('button', { name: 'close' }));

    await waitFor(() => expect(screen.queryByText(KOA)).not.toBeInTheDocument());
  });
});

describe('SpeciesSummaryDrawer reloading', () => {
  it('loads the summary again when it is reopened for another season', async () => {
    const requests = captureRequests('post', SEARCH_PATH, TWO_SPECIES);

    const { rerender } = renderWithProviders(
      <SpeciesSummaryDrawer open={true} onClose={() => undefined} plantingSeasonId={PLANTING_SEASON_ID} />
    );

    await waitFor(() => expect(requests).toHaveLength(1));

    rerender(<SpeciesSummaryDrawer open={true} onClose={() => undefined} plantingSeasonId={PLANTING_SEASON_ID + 1} />);

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(await requests[1].json()).toMatchObject({
      search: { values: [`${PLANTING_SEASON_ID + 1}`] },
    });
  });
});
