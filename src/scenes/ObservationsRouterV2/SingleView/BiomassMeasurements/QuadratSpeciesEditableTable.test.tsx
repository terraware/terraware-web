import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import { QuadratPosition } from './QuadratNotesComponent';
import QuadratSpeciesEditableTable from './QuadratSpeciesEditableTable';

const UPDATE_URL = '/api/v1/tracking/observations/7/plots/9';
const POSITION: QuadratPosition = 'NorthwestCorner';

const ABUTILON = { id: 103, scientificName: 'Abutilon incanum' };
const ACACIA = { id: 104, scientificName: 'Acacia koa' };

const UNLISTED_SPECIES = 'Pennisetum setaceum';

type SpeciesRow = {
  abundanceCount?: number;
  speciesId?: number;
  speciesName?: string;
  scientificName?: string;
  isInvasive?: boolean;
  isThreatened?: boolean;
};

const DEFAULT_SPECIES: SpeciesRow[] = [
  { speciesId: ABUTILON.id, abundanceCount: 4, isInvasive: true, isThreatened: false },
  { scientificName: UNLISTED_SPECIES, abundanceCount: 2, isInvasive: false, isThreatened: true },
];

type QuadratSetup = {
  editable?: boolean;
  holdUpdates?: (requestNumber: number) => boolean;
  position?: QuadratPosition | null;
  species?: SpeciesRow[];
  updateFails?: (requestNumber: number) => boolean;
};

const setupQuadrat = ({
  editable = true,
  holdUpdates = () => false,
  position = POSITION,
  species = DEFAULT_SPECIES,
  updateFails = () => false,
}: QuadratSetup = {}) => {
  mockGet('/api/v1/species', { species: [ABUTILON, ACACIA] });
  mockGet('/api/v1/tracking/observations/7/results', {
    observation: { id: 7, adHocPlot: { monitoringPlotId: 9 } },
  });
  const requests: Request[] = [];
  // One gate per held request, so they can be let go independently.
  const gates = new Map<number, () => void>();
  const waitForRelease = (requestNumber: number) => new Promise<void>((resolve) => gates.set(requestNumber, resolve));
  server.use(
    http.patch(UPDATE_URL, async ({ request }) => {
      const requestNumber = requests.push(request.clone());
      if (holdUpdates(requestNumber)) {
        await waitForRelease(requestNumber);
      }
      return updateFails(requestNumber) ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({ status: 'ok' });
    })
  );
  const { user } = renderWithProviders(
    <QuadratSpeciesEditableTable editable={editable} position={position ?? undefined} species={species} />,
    { route: '/observations/7', path: '/observations/:observationId' }
  );
  const removeLabel = (speciesName: string) =>
    strings.formatString(strings.REMOVE_SPECIES_NAMED, speciesName) as string;
  const removeRow = async (speciesName: string) =>
    await user.click(screen.getByRole('button', { name: removeLabel(speciesName) }));
  const confirmRemoval = async () => await user.click(screen.getByRole('button', { name: strings.REMOVE }));
  /** Opens the species picker on a row and returns the list of species it offers. */
  const openSpeciesEditor = async (speciesName: string) => {
    await user.dblClick(await screen.findByRole('cell', { name: speciesName }));
    await user.click(screen.getByPlaceholderText(speciesName));
    return await screen.findByRole('list');
  };
  const pickSpecies = async (speciesName: string, newSpeciesName: string) => {
    const options = await openSpeciesEditor(speciesName);
    await user.click(within(options).getByText(newSpeciesName));
  };
  const confirmSpeciesChange = async () =>
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
  return {
    user,
    requests,
    removeLabel,
    removeRow,
    confirmRemoval,
    openSpeciesEditor,
    pickSpecies,
    confirmSpeciesChange,
    releaseUpdate: (requestNumber: number) => gates.get(requestNumber)?.(),
  };
};

const detailsText = (...parts: string[]) => parts.join(strings.LIST_SEPARATOR);

const cellsOf = (rowIndex: number) => within(screen.getAllByRole('row')[rowIndex]).getAllByRole('cell');

describe('QuadratSpeciesEditableTable', () => {
  it('names each species from the species list and works out its percent cover', async () => {
    setupQuadrat();
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    expect(cellsOf(1)[0]).toHaveTextContent(ABUTILON.scientificName);
    expect(cellsOf(1)[1]).toHaveTextContent('4');
    expect(cellsOf(1)[2]).toHaveTextContent('16');
    expect(cellsOf(1)[3]).toHaveTextContent(strings.YES);
    expect(cellsOf(1)[4]).toHaveTextContent(strings.NO);

    expect(cellsOf(2)[0]).toHaveTextContent(UNLISTED_SPECIES);
    expect(cellsOf(2)[2]).toHaveTextContent('8');
  });
});

describe('QuadratSpeciesEditableTable removal', () => {
  it('does not offer removal in the additional species table', async () => {
    const { removeLabel } = setupQuadrat({ position: null });
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    expect(screen.queryByRole('button', { name: removeLabel(ABUTILON.scientificName) })).not.toBeInTheDocument();
  });

  it('does not offer removal when the observation is not editable', async () => {
    const { removeLabel } = setupQuadrat({ editable: false });
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    expect(screen.queryByRole('button', { name: removeLabel(ABUTILON.scientificName) })).not.toBeInTheDocument();
  });

  it('describes the values that will be lost before removing a species', async () => {
    const { requests, removeRow } = setupQuadrat();
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await removeRow(ABUTILON.scientificName);

    expect(
      screen.getByText(strings.formatString(strings.REMOVE_SPECIES_CONFIRMATION, ABUTILON.scientificName) as string)
    ).toBeInTheDocument();
    expect(screen.getByText(strings.REMOVE_SPECIES_CONFIRMATION_MESSAGE)).toBeInTheDocument();
    expect(
      screen.getByText(
        detailsText(
          `${strings.ABUNDANCE} 4`,
          `${strings.INVASIVE} ${strings.YES}`,
          `${strings.THREATENED} ${strings.NO}`
        )
      )
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('leaves abundance out of the summary when none was recorded', async () => {
    const { removeRow } = setupQuadrat({
      species: [{ speciesId: ABUTILON.id, isInvasive: false, isThreatened: false }],
    });
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await removeRow(ABUTILON.scientificName);

    expect(
      screen.getByText(detailsText(`${strings.INVASIVE} ${strings.NO}`, `${strings.THREATENED} ${strings.NO}`))
    ).toBeInTheDocument();
  });

  it('leaves the species alone when the removal is cancelled', async () => {
    const { user, requests, removeRow } = setupQuadrat();
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await removeRow(ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.queryByText(strings.REMOVE_SPECIES_CONFIRMATION_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: ABUTILON.scientificName })).toBeInTheDocument();
  });

  it('deletes the species from the quadrat once confirmed, and takes it off the table', async () => {
    const { requests, removeRow, confirmRemoval } = setupQuadrat();
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await removeRow(ABUTILON.scientificName);
    await confirmRemoval();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [{ type: 'DeleteQuadratSpecies', position: POSITION, speciesId: ABUTILON.id }],
    });
    await waitFor(() => expect(screen.queryByRole('cell', { name: ABUTILON.scientificName })).not.toBeInTheDocument());
    expect(screen.getByRole('cell', { name: UNLISTED_SPECIES })).toBeInTheDocument();
  });

  it('identifies a species that is not in the species list by its name', async () => {
    const { requests, removeRow, confirmRemoval } = setupQuadrat();
    await screen.findByRole('cell', { name: UNLISTED_SPECIES });

    await removeRow(UNLISTED_SPECIES);
    await confirmRemoval();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [{ type: 'DeleteQuadratSpecies', position: POSITION, scientificName: UNLISTED_SPECIES }],
    });
  });

  it('puts the species back when the removal fails', async () => {
    const { requests, removeRow, confirmRemoval } = setupQuadrat({ updateFails: () => true });
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await removeRow(ABUTILON.scientificName);
    await confirmRemoval();
    await waitFor(() => expect(requests).toHaveLength(1));

    expect(await screen.findByRole('cell', { name: ABUTILON.scientificName })).toBeInTheDocument();
  });
});

describe('QuadratSpeciesEditableTable species change', () => {
  it('does not offer a species change in the additional species table', async () => {
    const { user } = setupQuadrat({ position: null });

    await user.dblClick(await screen.findByRole('cell', { name: ABUTILON.scientificName }));

    expect(screen.queryByPlaceholderText(ABUTILON.scientificName)).not.toBeInTheDocument();
  });

  it('does not offer a species change when the observation is not editable', async () => {
    const { user } = setupQuadrat({ editable: false });

    await user.dblClick(await screen.findByRole('cell', { name: ABUTILON.scientificName }));

    expect(screen.queryByPlaceholderText(ABUTILON.scientificName)).not.toBeInTheDocument();
  });

  it('leaves the species the row already records out of the list', async () => {
    const { openSpeciesEditor } = setupQuadrat();

    const options = await openSpeciesEditor(ABUTILON.scientificName);

    expect(within(options).getByText(ACACIA.scientificName)).toBeInTheDocument();
    expect(within(options).queryByText(ABUTILON.scientificName)).not.toBeInTheDocument();
  });

  it('shows a species another row already records, but will not change to it', async () => {
    const { user, requests, openSpeciesEditor } = setupQuadrat();
    // The picker offers the organization species, so wait for them to arrive before opening it.
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    const options = await openSpeciesEditor(UNLISTED_SPECIES);

    expect(within(options).getByText(strings.ALREADY_IN_THIS_TABLE)).toBeInTheDocument();
    await user.click(within(options).getByText(ABUTILON.scientificName));

    expect(screen.queryByText(strings.CHANGE_SPECIES_CONFIRMATION)).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('will not change to a species another row records by name', async () => {
    const { user, requests, openSpeciesEditor } = setupQuadrat({
      species: [
        { speciesId: ABUTILON.id, abundanceCount: 4, isInvasive: false, isThreatened: false },
        { scientificName: ACACIA.scientificName, abundanceCount: 2, isInvasive: false, isThreatened: false },
      ],
    });
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    const options = await openSpeciesEditor(ABUTILON.scientificName);

    expect(within(options).getByText(strings.ALREADY_IN_THIS_TABLE)).toBeInTheDocument();
    await user.click(within(options).getByText(ACACIA.scientificName));

    expect(screen.queryByText(strings.CHANGE_SPECIES_CONFIRMATION)).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('describes the values that will move before changing a species', async () => {
    const { requests, pickSpecies } = setupQuadrat();

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);

    expect(screen.getByText(strings.CHANGE_SPECIES_CONFIRMATION)).toBeInTheDocument();
    expect(
      screen.getByText(
        strings.formatString(
          strings.CHANGE_SPECIES_CONFIRMATION_MESSAGE,
          ABUTILON.scientificName,
          ACACIA.scientificName
        ) as string
      )
    ).toBeInTheDocument();
    expect(screen.getByText(`${ABUTILON.scientificName} → ${ACACIA.scientificName}`)).toBeInTheDocument();
    expect(screen.getByText(`${strings.ABUNDANCE} 4`)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('does not promise to move values that belong to the species rather than the quadrat', async () => {
    const { pickSpecies } = setupQuadrat();

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);

    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.queryByText(new RegExp(strings.INVASIVE))).not.toBeInTheDocument();
    expect(dialog.queryByText(new RegExp(strings.THREATENED))).not.toBeInTheDocument();
  });

  it('leaves the species alone when the change is cancelled', async () => {
    const { user, requests, pickSpecies } = setupQuadrat();

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.queryByText(strings.CHANGE_SPECIES_CONFIRMATION)).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: ABUTILON.scientificName })).toBeInTheDocument();
  });

  it('moves the recorded abundance to the new species once confirmed', async () => {
    const { requests, pickSpecies, confirmSpeciesChange } = setupQuadrat();

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await confirmSpeciesChange();

    await waitFor(() => expect(requests).toHaveLength(1));
    // One request, so the API either applies both operations or rejects the change as a whole.
    expect(await requests[0].json()).toEqual({
      updates: [
        { type: 'DeleteQuadratSpecies', position: POSITION, speciesId: ABUTILON.id },
        { type: 'CreateQuadratSpecies', position: POSITION, speciesId: ACACIA.id, abundance: 4 },
      ],
    });
    expect(await screen.findByRole('cell', { name: ACACIA.scientificName })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: ABUTILON.scientificName })).not.toBeInTheDocument();
  });

  it('identifies a species that is not in the species list by its name', async () => {
    const { requests, pickSpecies, confirmSpeciesChange } = setupQuadrat();
    // The picker offers the organization species, so wait for them to arrive before opening it.
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await pickSpecies(UNLISTED_SPECIES, ACACIA.scientificName);
    await confirmSpeciesChange();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        { type: 'DeleteQuadratSpecies', position: POSITION, scientificName: UNLISTED_SPECIES },
        { type: 'CreateQuadratSpecies', position: POSITION, speciesId: ACACIA.id, abundance: 2 },
      ],
    });
  });

  it('records no abundance for the new species when none was recorded for the old one', async () => {
    const { requests, pickSpecies, confirmSpeciesChange } = setupQuadrat({
      species: [{ speciesId: ABUTILON.id, isInvasive: false, isThreatened: false }],
    });

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await confirmSpeciesChange();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        { type: 'DeleteQuadratSpecies', position: POSITION, speciesId: ABUTILON.id },
        { type: 'CreateQuadratSpecies', position: POSITION, speciesId: ACACIA.id, abundance: 0 },
      ],
    });
  });

  it('puts the old species back when the change fails', async () => {
    const { requests, pickSpecies, confirmSpeciesChange } = setupQuadrat({ updateFails: () => true });

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await confirmSpeciesChange();
    await waitFor(() => expect(requests).toHaveLength(1));

    expect(await screen.findByRole('cell', { name: ABUTILON.scientificName })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: ACACIA.scientificName })).not.toBeInTheDocument();
  });

  it('keeps an abundance edit made after a species change on the table', async () => {
    const { user, requests, pickSpecies, confirmSpeciesChange } = setupQuadrat();

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await confirmSpeciesChange();
    await screen.findByRole('cell', { name: ACACIA.scientificName });

    await user.dblClick(cellsOf(1)[1]);
    const abundance = screen.getByRole('spinbutton');
    await user.clear(abundance);
    await user.type(abundance, '7');
    await user.tab();

    await waitFor(() => expect(cellsOf(1)[1]).toHaveTextContent('7'));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(await requests[1].json()).toEqual({
      updates: [{ type: 'QuadratSpecies', position: POSITION, speciesId: ACACIA.id, abundance: 7 }],
    });
  });

  it('takes a row removed after a species change off the table', async () => {
    const { requests, pickSpecies, confirmSpeciesChange, removeRow, confirmRemoval } = setupQuadrat();

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await confirmSpeciesChange();
    await screen.findByRole('cell', { name: ACACIA.scientificName });

    await removeRow(ACACIA.scientificName);
    await confirmRemoval();

    await waitFor(() => expect(screen.queryByRole('cell', { name: ACACIA.scientificName })).not.toBeInTheDocument());
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(await requests[1].json()).toEqual({
      updates: [{ type: 'DeleteQuadratSpecies', position: POSITION, speciesId: ACACIA.id }],
    });
  });
});

describe('QuadratSpeciesEditableTable request order', () => {
  it('holds a removal until the abundance edit before it has landed', async () => {
    const { user, requests, removeRow, confirmRemoval, releaseUpdate } = setupQuadrat({
      holdUpdates: (requestNumber) => requestNumber === 1,
    });
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await user.dblClick(cellsOf(1)[1]);
    const abundance = screen.getByRole('spinbutton');
    await user.clear(abundance);
    await user.type(abundance, '7');
    await user.tab();
    await waitFor(() => expect(requests).toHaveLength(1));

    await removeRow(ABUTILON.scientificName);
    await confirmRemoval();
    await waitFor(() => expect(screen.queryByRole('cell', { name: ABUTILON.scientificName })).not.toBeInTheDocument());
    expect(requests).toHaveLength(1);

    releaseUpdate(1);

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(await requests[1].json()).toMatchObject({
      updates: [{ type: 'DeleteQuadratSpecies', speciesId: ABUTILON.id }],
    });
  });
});
