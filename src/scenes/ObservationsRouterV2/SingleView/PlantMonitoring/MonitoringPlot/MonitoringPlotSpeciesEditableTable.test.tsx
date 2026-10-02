import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import MonitoringPlotSpeciesEditableTable from './MonitoringPlotSpeciesEditableTable';

const UPDATE_URL = '/api/v1/tracking/observations/7/plots/9';

const ACACIA = { id: 101, scientificName: 'Acacia koa' };
const DUOSPERMA = { id: 102, scientificName: 'Duosperma angolense' };
const ABUTILON = { id: 103, scientificName: 'Abutilon eremitopetalum', commonName: 'Hidden-petaled Abutilon' };

type MockSpecies = {
  certainty: string;
  speciesId?: number;
  totalDead: number;
  totalExisting: number;
  totalLive: number;
};

const setup = () => {
  mockGet('/api/v1/species', { species: [ACACIA, DUOSPERMA, ABUTILON] });

  // The results endpoint is stateful so that the refetch an update triggers reflects the change,
  // the way it would against the real API.
  const plot = {
    monitoringPlotId: 9,
    species: [
      { certainty: 'Known', speciesId: ACACIA.id, totalExisting: 0, totalLive: 4, totalDead: 1 },
      { certainty: 'Known', speciesId: DUOSPERMA.id, totalExisting: 2, totalLive: 6, totalDead: 0 },
    ] as MockSpecies[],
    unknownSpecies: { certainty: 'Unknown', totalExisting: 0, totalLive: 2, totalDead: 1 } as MockSpecies,
  };

  const requests: Request[] = [];
  server.use(
    http.get('/api/v1/tracking/observations/7/results', () =>
      HttpResponse.json({
        observation: {
          observationId: 7,
          plantingSiteId: 1,
          isAdHoc: false,
          strata: [{ substrata: [{ monitoringPlots: [structuredClone(plot)] }] }],
        },
      })
    ),
    http.patch(UPDATE_URL, async ({ request }) => {
      requests.push(request.clone());
      const { updates } = (await request.json()) as { updates: (MockSpecies & { type: string })[] };
      updates.forEach((operation) => {
        const target =
          operation.certainty === 'Unknown'
            ? plot.unknownSpecies
            : plot.species.find((species) => species.speciesId === operation.speciesId);
        if (target) {
          Object.assign(target, {
            totalExisting: operation.totalExisting ?? target.totalExisting,
            totalLive: operation.totalLive ?? target.totalLive,
            totalDead: operation.totalDead ?? target.totalDead,
          });
        } else if (operation.speciesId !== undefined) {
          plot.species.push({ ...operation, certainty: 'Known' });
        }
      });
      return HttpResponse.json({ status: 'ok' });
    })
  );

  const { user } = renderWithProviders(<MonitoringPlotSpeciesEditableTable />, {
    route: '/observations/7/plots/9',
    path: '/observations/:observationId/plots/:monitoringPlotId',
  });

  const rowFor = async (speciesName: string) => {
    await screen.findByRole('cell', { name: speciesName });
    const row = screen
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByRole('cell', { name: speciesName }));
    if (!row) {
      throw new Error(`No row for ${speciesName}`);
    }
    return row;
  };

  /** Opens the species list and picks one. Clicking the field toggles the list, so open it once. */
  const openSpeciesList = async (input: HTMLElement) => {
    await user.click(input);
  };

  const pickSpecies = async (scientificName: string) => {
    await user.click(await screen.findByText(scientificName));
  };

  const clickRemoveIn = async (row: HTMLElement, speciesName: string) =>
    await user.click(
      within(row).getByRole('button', {
        name: strings.formatString(strings.REMOVE_SPECIES_NAMED, speciesName) as string,
      })
    );

  return { user, requests, rowFor, openSpeciesList, pickSpecies, clickRemoveIn };
};

describe('MonitoringPlotSpeciesEditableTable', () => {
  it('adds a species with the counts entered in the inline row', async () => {
    const { user, requests, openSpeciesList, pickSpecies } = setup();

    await user.click(await screen.findByRole('button', { name: strings.ADD_SPECIES }));
    await openSpeciesList(screen.getByPlaceholderText(strings.SEARCH_SPECIES));
    await pickSpecies(ABUTILON.scientificName);

    const counts = screen.getAllByPlaceholderText(strings.REQUIRED);
    expect(counts).toHaveLength(3);
    await user.type(counts[0], '2');
    await user.type(counts[1], '6');
    await user.type(counts[2], '0');

    await user.click(screen.getByRole('button', { name: strings.ADD_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'MonitoringSpecies',
          certainty: 'Known',
          speciesId: ABUTILON.id,
          totalExisting: 2,
          totalLive: 6,
          totalDead: 0,
        },
      ],
    });
    expect(await screen.findByRole('cell', { name: ABUTILON.scientificName })).toBeVisible();
  });

  it('will not add a species until it is named and one count is above 0', async () => {
    const { user, requests, openSpeciesList, pickSpecies } = setup();

    await user.click(await screen.findByRole('button', { name: strings.ADD_SPECIES }));
    const submit = screen.getByRole('button', { name: strings.ADD_SPECIES });
    expect(submit).toBeDisabled();

    await openSpeciesList(screen.getByPlaceholderText(strings.SEARCH_SPECIES));
    await pickSpecies(ABUTILON.scientificName);
    expect(submit).toBeDisabled();

    // Every count is filled in, but a species with nothing recorded against it is not an entry.
    const counts = screen.getAllByPlaceholderText(strings.REQUIRED);
    await user.type(counts[0], '0');
    await user.type(counts[1], '0');
    await user.type(counts[2], '0');
    expect(submit).toBeDisabled();

    await user.clear(counts[1]);
    await user.type(counts[1], '3');
    expect(submit).toBeEnabled();
    expect(requests).toHaveLength(0);
  });

  it('zeroes a species out when its removal is confirmed', async () => {
    const { user, requests, rowFor, clickRemoveIn } = setup();

    await clickRemoveIn(await rowFor(strings.UNKNOWN), strings.UNKNOWN);

    const title = strings.formatString(strings.REMOVE_SPECIES_CONFIRMATION, strings.UNKNOWN) as string;
    expect(await screen.findByText(title)).toBeVisible();
    expect(requests).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: strings.REMOVE }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'MonitoringSpecies',
          certainty: 'Unknown',
          totalExisting: 0,
          totalLive: 0,
          totalDead: 0,
        },
      ],
    });
    // The row leaves the table as soon as it has nothing recorded against it.
    await waitFor(() => expect(screen.queryByRole('cell', { name: strings.UNKNOWN })).not.toBeInTheDocument());
  });

  it('leaves the species alone when a removal is cancelled', async () => {
    const { user, requests, rowFor, clickRemoveIn } = setup();

    await clickRemoveIn(await rowFor(strings.UNKNOWN), strings.UNKNOWN);
    await user.click(await screen.findByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(await screen.findByRole('cell', { name: strings.UNKNOWN })).toBeVisible();
  });

  it('moves the recorded counts to the new species when a species change is confirmed', async () => {
    const { user, requests, rowFor, openSpeciesList, pickSpecies } = setup();

    const row = await rowFor(DUOSPERMA.scientificName);
    await user.dblClick(within(row).getByRole('cell', { name: DUOSPERMA.scientificName }));
    await openSpeciesList(screen.getByPlaceholderText(DUOSPERMA.scientificName));
    await pickSpecies(ABUTILON.scientificName);

    expect(await screen.findByText(strings.CHANGE_SPECIES_CONFIRMATION)).toBeVisible();
    expect(requests).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'MonitoringSpecies',
          certainty: 'Known',
          speciesId: DUOSPERMA.id,
          totalExisting: 0,
          totalLive: 0,
          totalDead: 0,
        },
        {
          type: 'MonitoringSpecies',
          certainty: 'Known',
          speciesId: ABUTILON.id,
          totalExisting: 2,
          totalLive: 6,
          totalDead: 0,
        },
      ],
    });
    // The counts move across: the old species is left with nothing and drops off the table.
    expect(await screen.findByRole('cell', { name: ABUTILON.scientificName })).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('cell', { name: DUOSPERMA.scientificName })).not.toBeInTheDocument());
  });

  it('lifts the row being added above the action bar so its dropdown is not covered', async () => {
    const { user, openSpeciesList } = setup();

    await user.click(await screen.findByRole('button', { name: strings.ADD_SPECIES }));
    await openSpeciesList(screen.getByPlaceholderText(strings.SEARCH_SPECIES));

    const draftRow = screen
      .getAllByRole('row')
      .find((candidate) => within(candidate).queryByPlaceholderText(strings.SEARCH_SPECIES));
    // material-react-table makes every body row a stacking context, so the row has to out-rank the
    // bottom toolbar (z-index 2) for the dropdown inside it to paint over the Add species actions.
    expect(Number(getComputedStyle(draftRow as HTMLElement).zIndex)).toBeGreaterThan(2);
  });

  it('does not offer a species that is already recorded in the plot', async () => {
    const { user, openSpeciesList } = setup();

    await user.click(await screen.findByRole('button', { name: strings.ADD_SPECIES }));
    await openSpeciesList(screen.getByPlaceholderText(strings.SEARCH_SPECIES));

    expect(await screen.findByText(ABUTILON.scientificName)).toBeVisible();
    // Rows are keyed by species, so a second row for one already in the table cannot exist.
    expect(screen.queryAllByText(ACACIA.scientificName)).toHaveLength(1);
  });
});
