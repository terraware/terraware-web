import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';

const UPDATE_URL = '/api/v1/tracking/observations/7/plots/9';

const setup = (treeGrowthForm = 'Tree', forestType = 'Mangrove', trunkNumber = 1, updatesFail = false) => {
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/tracking/observations/7/results', {
    observation: {
      id: 7,
      adHocPlot: { monitoringPlotId: 9 },
      biomassMeasurements: {
        forestType,
        trees: [
          {
            id: 11,
            treeNumber: 1,
            trunkNumber,
            treeGrowthForm,
            speciesName: 'Acacia koa',
            boleHeight: 6,
            diameterAtBreastHeight: 25,
            height: 12,
            pointOfMeasurement: 1.3,
            treeCrownDiameter: 400,
            shrubDiameter: 150,
          },
        ],
      },
    },
  });
  const requests: Request[] = [];
  server.use(
    http.patch(UPDATE_URL, ({ request }) => {
      requests.push(request.clone());
      return updatesFail ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({ status: 'ok' });
    })
  );
  const { user } = renderWithProviders(<TreesAndShrubsEditableTable />, {
    route: '/observations/7',
    path: '/observations/:observationId',
  });
  const edit = async (oldValue: string, newValue: string) => {
    await user.dblClick(await screen.findByRole('cell', { name: oldValue }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    if (newValue) {
      await user.type(input, newValue);
    }
    await user.tab();
  };
  const removeRow = async (label: string) =>
    await user.click(
      screen.getByRole('button', { name: strings.formatString(strings.REMOVE_SPECIES_NAMED, label) as string })
    );
  return { user, requests, edit, removeRow };
};

describe('TreesAndShrubsEditableTable', () => {
  it.each([
    ['Tree', '25', '101', 'diameterAtBreastHeight', 'DBH_CM', 'Mangrove'],
    ['Tree', '12', '50', 'height', 'HEIGHT_M', 'Mangrove'],
    ['Tree', '1.3', '3', 'pointOfMeasurement', 'POM_M', 'Mangrove'],
    ['Tree', '400', '1501', 'treeCrownDiameter', 'CROWN_DIAMETER_CM', 'Mangrove'],
    ['Shrub', '150', '301', 'shrubDiameter', 'CROWN_DIAMETER_CM', 'Mangrove'],
    ['Tree', '6', '46', 'boleHeight', 'BOLE_HEIGHT_M', 'Terrestrial'],
  ] as const)(
    'requires confirmation before saving unexpected %s %s → %s',
    async (growthForm, oldValue, value, field, label, forestType) => {
      const { user, requests, edit } = setup(growthForm, forestType);
      await edit(oldValue, value);

      const warning = strings.formatString(strings.UNEXPECTED_BIOMASS_MEASUREMENT, value, strings[label]) as string;
      expect(await screen.findByText(warning)).toBeVisible();
      expect(requests).toHaveLength(0);

      // Moving focus must not dismiss the warning or implicitly accept the measurement.
      await user.tab();
      expect(screen.getByText(warning)).toBeVisible();
      expect(requests).toHaveLength(0);

      await user.click(screen.getByRole('button', { name: strings.KEEP_VALUE }));
      await waitFor(() => expect(requests).toHaveLength(1));
      expect(await requests[0].json()).toEqual({
        updates: [{ type: 'RecordedTree', recordedTreeId: 11, [field]: value }],
      });
      expect(await screen.findByRole('cell', { name: value })).toBeVisible();
    }
  );

  it('allows correcting an unexpected value without saving it first', async () => {
    const { user, requests, edit } = setup();
    await edit('12', '130');
    await user.click(await screen.findByRole('button', { name: strings.EDIT_VALUE }));
    expect(requests).toHaveLength(0);
    expect(await screen.findByRole('cell', { name: '12' })).toBeVisible();

    await edit('12', '30');
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [{ type: 'RecordedTree', recordedTreeId: 11, height: '30' }],
    });
  });

  it('saves a value at the expected limit without a warning', async () => {
    const { requests, edit } = setup();
    await edit('12', '45');
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByRole('button', { name: strings.KEEP_VALUE })).not.toBeInTheDocument();
    expect(await requests[0].json()).toEqual({
      updates: [{ type: 'RecordedTree', recordedTreeId: 11, height: '45' }],
    });
  });

  describe('bole height', () => {
    it('saves a bole height for a terrestrial tree', async () => {
      const { requests, edit } = setup('Tree', 'Terrestrial');
      await edit('6', '7.5');
      await waitFor(() => expect(requests).toHaveLength(1));
      expect(await requests[0].json()).toEqual({
        updates: [{ type: 'RecordedTree', recordedTreeId: 11, boleHeight: '7.5' }],
      });
    });

    it('clears a bole height by saving null', async () => {
      const { requests, edit } = setup('Tree', 'Terrestrial');
      await edit('6', '');
      await waitFor(() => expect(requests).toHaveLength(1));
      expect(await requests[0].json()).toEqual({
        updates: [{ type: 'RecordedTree', recordedTreeId: 11, boleHeight: null }],
      });
    });

    it('does not allow editing bole height on additional stems', async () => {
      const { user } = setup('Trunk', 'Terrestrial', 2);
      await user.dblClick(await screen.findByRole('cell', { name: '6' }));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('hides bole height for mangrove forests', async () => {
      setup('Tree', 'Mangrove');
      expect(await screen.findByRole('cell', { name: '12' })).toBeVisible();
      expect(screen.queryByRole('cell', { name: '6' })).not.toBeInTheDocument();
    });
  });
});

const detailsText = (...parts: string[]) => parts.join(strings.LIST_SEPARATOR);

const ABUTILON = { id: 103, scientificName: 'Abutilon incanum' };
const ACACIA = { id: 104, scientificName: 'Acacia koa' };

const setupTrunks = (trunkCount = 2, updatesFail = false, holdFirstUpdate = false, failFromRequest = 0) => {
  mockGet('/api/v1/species', { species: [ABUTILON, ACACIA] });
  mockGet('/api/v1/tracking/observations/7/results', {
    observation: {
      id: 7,
      adHocPlot: { monitoringPlotId: 9 },
      biomassMeasurements: {
        forestType: 'Terrestrial',
        trees: Array.from({ length: trunkCount }, (_, index) => index + 1).map((trunkNumber) => ({
          id: 100 + trunkNumber,
          treeNumber: 5,
          trunkNumber,
          treeGrowthForm: trunkCount > 1 ? 'Trunk' : 'Tree',
          speciesName: 'Eucalyptus dalveenica',
          diameterAtBreastHeight: 9,
          height: 7,
          pointOfMeasurement: 1.3,
        })),
      },
    },
  });
  const requests: Request[] = [];
  let releaseFirstUpdate!: () => void;
  const firstUpdateGate = new Promise<void>((resolve) => {
    releaseFirstUpdate = resolve;
  });
  server.use(
    http.patch(UPDATE_URL, async ({ request }) => {
      requests.push(request.clone());
      if (requests.length === 1 && holdFirstUpdate) {
        await firstUpdateGate;
      }
      return updatesFail || (failFromRequest > 0 && requests.length >= failFromRequest)
        ? new HttpResponse(null, { status: 500 })
        : HttpResponse.json({ status: 'ok' });
    })
  );
  const { user } = renderWithProviders(<TreesAndShrubsEditableTable />, {
    route: '/observations/7',
    path: '/observations/:observationId',
  });
  const pickSpecies = async (cellName: string, scientificName: string) => {
    const cells = await screen.findAllByRole('cell', { name: cellName });
    await user.dblClick(cells[0]);
    await user.click(screen.getByPlaceholderText(cellName));
    await user.click(await screen.findByText(scientificName));
  };
  return { user, requests, pickSpecies, releaseFirstUpdate: () => releaseFirstUpdate() };
};

describe('TreesAndShrubsEditableTable species change', () => {
  it('changes the species of every trunk once confirmed', async () => {
    const { user, requests, pickSpecies } = setupTrunks();

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);

    expect(screen.getByText(strings.CHANGE_SPECIES_CONFIRMATION)).toBeInTheDocument();
    // The tree is named by its own number, not the trunk's, and the trunk count is spelled out.
    expect(
      screen.getByText(
        strings.formatString(strings.CHANGE_TREE_SPECIES_MESSAGE_TRUNKS, '5', ABUTILON.scientificName, '2') as string
      )
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));
    // One operation; the server applies it to every trunk of the tree.
    expect(await requests[0].json()).toEqual({
      updates: [{ type: 'RecordedTree', recordedTreeId: 101, speciesId: ABUTILON.id }],
    });
    await waitFor(() => expect(screen.getAllByRole('cell', { name: ABUTILON.scientificName })).toHaveLength(2));
    expect(screen.queryByRole('cell', { name: 'Eucalyptus dalveenica' })).not.toBeInTheDocument();
  });

  it('does not mention trunks for a tree that has only one', async () => {
    const { pickSpecies } = setupTrunks(1);

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);

    expect(
      screen.getByText(
        strings.formatString(strings.CHANGE_TREE_SPECIES_MESSAGE, '5', ABUTILON.scientificName) as string
      )
    ).toBeInTheDocument();
  });

  it('puts the old species back when the change fails', async () => {
    const { user, requests, pickSpecies } = setupTrunks(2, true);

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));

    await waitFor(() => expect(screen.getAllByRole('cell', { name: 'Eucalyptus dalveenica' })).toHaveLength(2));
  });

  it('drops a flag edit that was sent for the species the change did not stick', async () => {
    const { user, requests, pickSpecies, releaseFirstUpdate } = setupTrunks(1, true, true);

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));

    const invasiveCell = within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8];
    expect(invasiveCell).toHaveTextContent(strings.NO);
    await user.dblClick(invasiveCell);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: strings.YES }));
    await user.tab();
    await waitFor(() => expect(requests).toHaveLength(2));

    releaseFirstUpdate();

    await waitFor(() => expect(screen.getByRole('cell', { name: 'Eucalyptus dalveenica' })).toBeInTheDocument());
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8]).toHaveTextContent(strings.NO);
  });

  it('keeps a change that succeeded when a later one fails', async () => {
    const { user, requests, pickSpecies } = setupTrunks(1, false, false, 2);

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));
    await screen.findByRole('cell', { name: ABUTILON.scientificName });

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(2));

    await waitFor(() => expect(screen.getByRole('cell', { name: ABUTILON.scientificName })).toBeInTheDocument());
    expect(screen.queryByRole('cell', { name: 'Eucalyptus dalveenica' })).not.toBeInTheDocument();
  });

  it('leaves the species alone when the change is cancelled', async () => {
    const { user, requests, pickSpecies } = setupTrunks();

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.getAllByRole('cell', { name: 'Eucalyptus dalveenica' })).toHaveLength(2);
  });
});

describe('TreesAndShrubsEditableTable removal', () => {
  it('deletes the plant once the removal is confirmed, and takes it off the table', async () => {
    const { user, requests, removeRow } = setup();
    await screen.findByRole('cell', { name: 'Acacia koa' });

    await removeRow('1');
    expect(screen.getByText(strings.formatString(strings.REMOVE_TREE_CONFIRMATION, '1') as string)).toBeInTheDocument();
    expect(
      screen.getByText(
        detailsText(
          `${strings.GROWTH_FORM} ${strings.TREE}`,
          `${strings.DBH_CM} 25`,
          `${strings.POM_M} 1.3`,
          `${strings.HEIGHT_M} 12`,
          `${strings.INVASIVE} ${strings.NO}`,
          `${strings.THREATENED} ${strings.NO}`,
          `${strings.DEAD} ${strings.NO}`
        )
      )
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: strings.REMOVE }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [{ type: 'DeleteRecordedTree', recordedTreeId: 11 }],
    });
    await waitFor(() => expect(screen.queryByRole('cell', { name: 'Acacia koa' })).not.toBeInTheDocument());
  });

  it('puts the plant back when the deletion fails', async () => {
    const { user, requests, removeRow } = setup('Tree', 'Mangrove', 1, true);
    await screen.findByRole('cell', { name: 'Acacia koa' });

    await removeRow('1');
    await user.click(screen.getByRole('button', { name: strings.REMOVE }));
    await waitFor(() => expect(requests).toHaveLength(1));

    expect(await screen.findByRole('cell', { name: 'Acacia koa' })).toBeInTheDocument();
  });

  it('leaves the plant alone when the removal is cancelled', async () => {
    const { user, requests, removeRow } = setup();
    await screen.findByRole('cell', { name: 'Acacia koa' });

    await removeRow('1');
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.getByRole('cell', { name: 'Acacia koa' })).toBeInTheDocument();
  });

  it('names a trunk by its tree and trunk number, and a shrub as a shrub', async () => {
    const { removeRow } = setup('Trunk', 'Mangrove', 2);
    await screen.findByRole('cell', { name: 'Acacia koa' });

    await removeRow('1_2');
    expect(
      screen.getByText(strings.formatString(strings.REMOVE_TREE_CONFIRMATION, '1_2') as string)
    ).toBeInTheDocument();
  });

  it('describes a shrub with its crown diameter rather than tree measurements', async () => {
    const { removeRow } = setup('Shrub');
    await screen.findByRole('cell', { name: 'Acacia koa' });

    await removeRow('1');
    expect(
      screen.getByText(strings.formatString(strings.REMOVE_SHRUB_CONFIRMATION, '1') as string)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        detailsText(
          `${strings.GROWTH_FORM} ${strings.SHRUB}`,
          `${strings.CROWN_DIAMETER_CM} 150`,
          `${strings.INVASIVE} ${strings.NO}`,
          `${strings.THREATENED} ${strings.NO}`,
          `${strings.DEAD} ${strings.NO}`
        )
      )
    ).toBeInTheDocument();
  });
});
