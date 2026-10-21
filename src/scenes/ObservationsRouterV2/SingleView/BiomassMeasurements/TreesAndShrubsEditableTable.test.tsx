import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';

const UPDATE_URL = '/api/v1/tracking/observations/7/plots/9';

const setup = (treeGrowthForm = 'Tree', forestType = 'Mangrove', trunkNumber = 1) => {
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
      return HttpResponse.json({ status: 'ok' });
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

const setupTrunks = (trunkCount = 2, forestType = 'Terrestrial') => {
  mockGet('/api/v1/species', { species: [ABUTILON] });
  mockGet('/api/v1/tracking/observations/7/results', {
    observation: {
      id: 7,
      adHocPlot: { monitoringPlotId: 9 },
      biomassMeasurements: {
        forestType,
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
  server.use(
    http.patch(UPDATE_URL, ({ request }) => {
      requests.push(request.clone());
      return HttpResponse.json({ status: 'ok' });
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
  return { user, requests, pickSpecies };
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

describe('TreesAndShrubsEditableTable adding', () => {
  const startAdd = async (user: ReturnType<typeof renderWithProviders>['user']) => {
    await user.click(await screen.findByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    await user.click(screen.getByPlaceholderText(strings.SEARCH_SPECIES));
    await user.click(await screen.findByText(ABUTILON.scientificName));
  };
  const chooseGrowthForm = async (user: ReturnType<typeof renderWithProviders>['user'], label: string) => {
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: label }));
  };
  const fill = async (user: ReturnType<typeof renderWithProviders>['user'], values: number[]) => {
    const inputs = screen.getAllByPlaceholderText(strings.REQUIRED);
    expect(inputs).toHaveLength(values.length);
    for (const [index, value] of values.entries()) {
      await user.type(inputs[index], String(value));
    }
  };

  it('adds a tree with its required measurements', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);

    await fill(user, [12, 1.3, 8]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'CreateRecordedTree',
          speciesId: ABUTILON.id,
          treeGrowthForm: 'Tree',
          isDead: false,
          diameterAtBreastHeight: 12,
          pointOfMeasurement: 1.3,
          height: 8,
        },
      ],
    });
  });

  it('asks a shrub for its crown diameter instead of the tree measurements', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.SHRUB);

    await fill(user, [40]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'CreateRecordedTree',
          speciesId: ABUTILON.id,
          treeGrowthForm: 'Shrub',
          isDead: false,
          shrubDiameter: 40,
        },
      ],
    });
  });

  it('will not add until the species, growth form and its measurements are given', async () => {
    const { user, requests } = setupTrunks();
    await user.click(await screen.findByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    const submit = screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB });
    expect(submit).toBeDisabled();

    await user.click(screen.getByPlaceholderText(strings.SEARCH_SPECIES));
    await user.click(await screen.findByText(ABUTILON.scientificName));
    expect(submit).toBeDisabled();

    await chooseGrowthForm(user, strings.TREE);
    expect(submit).toBeDisabled();

    await fill(user, [12, 1.3, 8]);
    expect(submit).toBeEnabled();
    expect(requests).toHaveLength(0);
  });

  it('offers a tree an optional crown diameter only in a mangrove forest', async () => {
    const { user, requests } = setupTrunks(2, 'Mangrove');
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);

    await fill(user, [12, 1.3, 8]);
    const crownDiameter = screen.getAllByRole('spinbutton')[3];
    expect(crownDiameter).toBeEnabled();
    await user.type(crownDiameter, '3');

    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'CreateRecordedTree',
          speciesId: ABUTILON.id,
          treeGrowthForm: 'Tree',
          isDead: false,
          diameterAtBreastHeight: 12,
          pointOfMeasurement: 1.3,
          height: 8,
          treeCrownDiameter: 3,
        },
      ],
    });
  });

  it('abandons the new plant when the add is cancelled', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.queryByPlaceholderText(strings.SEARCH_SPECIES)).not.toBeInTheDocument();
  });
});
