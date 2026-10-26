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

const invasiveFlagOf = () => within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8];

const ABUTILON = { id: 103, scientificName: 'Abutilon incanum' };
const ACACIA = { id: 104, scientificName: 'Acacia koa' };

type TrunkSetup = {
  /** Mangrove forests make crown diameter editable for trees. */
  forestType?: string;
  /** Which updates hang until released, by 1-based request order, so work can overlap them. */
  holdUpdates?: (requestNumber: number) => boolean;
  isInvasive?: boolean;
  isThreatened?: boolean;
  speciesId?: number;
  trunkCount?: number;
  /** Which updates fail, by 1-based request order. */
  updateFails?: (requestNumber: number) => boolean;
};

const setupTrunks = ({
  forestType = 'Terrestrial',
  holdUpdates = () => false,
  isInvasive,
  isThreatened,
  speciesId,
  trunkCount = 2,
  updateFails = () => false,
}: TrunkSetup = {}) => {
  mockGet('/api/v1/species', { species: [ABUTILON, ACACIA] });
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
          speciesId,
          isInvasive,
          isThreatened,
          speciesName: 'Eucalyptus dalveenica',
          diameterAtBreastHeight: 9,
          height: 7,
          pointOfMeasurement: 1.3,
        })),
      },
    },
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
  const edit = async (oldValue: string, newValue: string) => {
    await user.dblClick(await screen.findByRole('cell', { name: oldValue }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, newValue);
    await user.tab();
  };
  const removeRow = async (label: string) =>
    await user.click(
      screen.getByRole('button', { name: strings.formatString(strings.REMOVE_SPECIES_NAMED, label) as string })
    );
  return {
    user,
    requests,
    edit,
    pickSpecies,
    removeRow,
    releaseUpdate: (requestNumber: number) => gates.get(requestNumber)?.(),
  };
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
    const { pickSpecies } = setupTrunks({ trunkCount: 1 });

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);

    expect(
      screen.getByText(
        strings.formatString(strings.CHANGE_TREE_SPECIES_MESSAGE, '5', ABUTILON.scientificName) as string
      )
    ).toBeInTheDocument();
  });

  it('puts the old species back when the change fails', async () => {
    const { user, requests, pickSpecies } = setupTrunks({ updateFails: () => true });

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));

    await waitFor(() => expect(screen.getAllByRole('cell', { name: 'Eucalyptus dalveenica' })).toHaveLength(2));
  });

  it('drops a flag edit that was sent for the species the change did not stick', async () => {
    const { user, requests, pickSpecies, releaseUpdate } = setupTrunks({
      trunkCount: 1,
      holdUpdates: (n) => n === 1,
      updateFails: () => true,
    });

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));

    const invasiveCell = within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8];
    expect(invasiveCell).toHaveTextContent(strings.NO);
    await user.dblClick(invasiveCell);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: strings.YES }));
    await user.tab();
    await waitFor(() => expect(invasiveFlagOf()).toHaveTextContent(strings.YES));

    releaseUpdate(1);
    await waitFor(() => expect(requests).toHaveLength(2));

    await waitFor(() => expect(screen.getByRole('cell', { name: 'Eucalyptus dalveenica' })).toBeInTheDocument());
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8]).toHaveTextContent(strings.NO);
  });

  it('keeps a change that succeeded when a later one fails', async () => {
    const { user, requests, pickSpecies } = setupTrunks({ trunkCount: 1, updateFails: (n) => n >= 2 });

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

  it('keeps a flag saved after the species went back, when the earlier change fails', async () => {
    const { user, requests, pickSpecies, releaseUpdate } = setupTrunks({
      trunkCount: 1,
      holdUpdates: (n) => n === 1,
      speciesId: ACACIA.id,
      updateFails: (n) => n === 1,
    });

    await pickSpecies(ACACIA.scientificName, ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await waitFor(() => expect(requests).toHaveLength(1));

    await pickSpecies(ABUTILON.scientificName, ACACIA.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CHANGE_SPECIES }));
    await screen.findByRole('cell', { name: ACACIA.scientificName });

    const invasiveCell = within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8];
    await user.dblClick(invasiveCell);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: strings.YES }));
    await user.tab();
    await waitFor(() => expect(invasiveFlagOf()).toHaveTextContent(strings.YES));

    releaseUpdate(1);
    await waitFor(() => expect(requests).toHaveLength(3));

    await waitFor(() => expect(screen.getByRole('cell', { name: ACACIA.scientificName })).toBeInTheDocument());
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[8]).toHaveTextContent(strings.YES);
  });

  it('leaves the species alone when the change is cancelled', async () => {
    const { user, requests, pickSpecies } = setupTrunks();

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.getAllByRole('cell', { name: 'Eucalyptus dalveenica' })).toHaveLength(2);
  });

  it('does not promise to move values that belong to the species rather than the plant', async () => {
    const { pickSpecies } = setupTrunks();

    await pickSpecies('Eucalyptus dalveenica', ABUTILON.scientificName);

    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText(new RegExp(strings.GROWTH_FORM))).toBeInTheDocument();
    expect(dialog.queryByText(new RegExp(strings.INVASIVE))).not.toBeInTheDocument();
    expect(dialog.queryByText(new RegExp(strings.THREATENED))).not.toBeInTheDocument();
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

describe('TreesAndShrubsEditableTable request order', () => {
  it('holds a removal until the measurement edit before it has landed', async () => {
    const { user, requests, edit, removeRow, releaseUpdate } = setupTrunks({
      holdUpdates: (n) => n === 1,
      trunkCount: 1,
    });

    await edit('9', '11');
    await waitFor(() => expect(requests).toHaveLength(1));

    await removeRow('5');
    await user.click(screen.getByRole('button', { name: strings.REMOVE }));
    await waitFor(() => expect(screen.queryByRole('cell', { name: '5' })).not.toBeInTheDocument());
    expect(requests).toHaveLength(1);

    releaseUpdate(1);

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(await requests[1].json()).toMatchObject({ updates: [{ type: 'DeleteRecordedTree', recordedTreeId: 101 }] });
  });
});

describe('TreesAndShrubsEditableTable adding', () => {
  const pickDraftSpecies = async (user: ReturnType<typeof renderWithProviders>['user'], scientificName: string) => {
    await user.click(screen.getByPlaceholderText(strings.SEARCH_SPECIES));
    const options = await screen.findByRole('list');
    await user.click(await within(options).findByText(scientificName));
  };
  const startAdd = async (user: ReturnType<typeof renderWithProviders>['user']) => {
    await user.click(await screen.findByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    await pickDraftSpecies(user, ABUTILON.scientificName);
  };
  const draftRow = () => screen.getAllByRole('row').at(-1) as HTMLElement;
  const draftSelect = (index: number) => within(draftRow()).getAllByRole('combobox')[index];
  const chooseGrowthForm = async (user: ReturnType<typeof renderWithProviders>['user'], label: string) => {
    await user.click(draftSelect(0));
    await user.click(await screen.findByRole('option', { name: label }));
  };
  const setDraftFlag = async (
    user: ReturnType<typeof renderWithProviders>['user'],
    flag: 'isInvasive' | 'isThreatened' | 'isDead',
    label: string
  ) => {
    await user.click(draftSelect({ isInvasive: 1, isThreatened: 2, isDead: 3 }[flag]));
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
    const { user, requests } = setupTrunks({ forestType: 'Mangrove' });
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

  it('asks about an unexpected measurement before recording the plant', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    // A height of 450 m is far outside the expected range.
    await fill(user, [12, 1.3, 450]);

    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    expect(
      screen.getByText(strings.formatString(strings.UNEXPECTED_BIOMASS_MEASUREMENT, '450', strings.HEIGHT_M) as string)
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: strings.KEEP_VALUE }));
    await waitFor(() => expect(requests).toHaveLength(1));
  });

  it('will not record a diameter the server cannot store as whole centimeters', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.SHRUB);
    await fill(user, [1.5]);

    expect(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB })).toBeDisabled();
    expect(requests).toHaveLength(0);
  });

  it('keeps the draft when the plant could not be recorded', async () => {
    const { user, requests } = setupTrunks({ updateFails: () => true });
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await fill(user, [12, 1.3, 8]);

    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    await waitFor(() => expect(requests).toHaveLength(1));

    // Nothing was recorded, so what was typed has to still be there to retry.
    expect(screen.getByPlaceholderText(strings.SEARCH_SPECIES)).toBeInTheDocument();
  });

  it('does not offer notes on the plant being added', async () => {
    const { user } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);

    const notesCell = within(draftRow()).getAllByRole('cell')[11];
    await user.dblClick(notesCell);
    expect(within(notesCell).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(notesCell).queryByRole('button')).not.toBeInTheDocument();
  });

  it('ignores a value the chosen growth form does not record', async () => {
    const { user } = setupTrunks({ forestType: 'Mangrove' });
    await startAdd(user);

    await chooseGrowthForm(user, strings.TREE);
    await user.type(screen.getAllByRole('spinbutton')[3], '1.5');
    await chooseGrowthForm(user, strings.SHRUB);
    await fill(user, [40]);

    expect(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB })).toBeEnabled();
  });

  it('does not warn about an outlier the chosen growth form does not record', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);

    await chooseGrowthForm(user, strings.TREE);
    await fill(user, [12, 1.3, 450]);
    await chooseGrowthForm(user, strings.SHRUB);
    await fill(user, [40]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    expect(screen.queryByRole('button', { name: strings.KEEP_VALUE })).not.toBeInTheDocument();
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

  it('records the plant once however many times the button is clicked', async () => {
    const { user, requests, releaseUpdate } = setupTrunks({ holdUpdates: (n) => n === 1 });
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await fill(user, [12, 1.3, 8]);

    const submit = screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB });
    await user.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());

    releaseUpdate(1);
    await waitFor(() => expect(screen.queryByPlaceholderText(strings.SEARCH_SPECIES)).not.toBeInTheDocument());
    expect(requests).toHaveLength(1);
  });

  it('leaves a newly started draft alone when an earlier create finishes', async () => {
    const { user, requests, releaseUpdate } = setupTrunks({ holdUpdates: (n) => n === 1 });
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await fill(user, [12, 1.3, 8]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    await waitFor(() => expect(requests).toHaveLength(1));

    await user.click(screen.getByRole('button', { name: strings.CANCEL }));
    await startAdd(user);
    await chooseGrowthForm(user, strings.SHRUB);
    await fill(user, [40]);

    releaseUpdate(1);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.getByPlaceholderText(strings.SEARCH_SPECIES)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB })).toBeEnabled();
  });

  it('keeps a plant locked while its own create runs, whatever else finishes', async () => {
    const { user, requests, releaseUpdate } = setupTrunks({ holdUpdates: () => true });

    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await fill(user, [12, 1.3, 8]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));
    await waitFor(() => expect(requests).toHaveLength(1));

    await user.click(screen.getByRole('button', { name: strings.CANCEL }));
    await startAdd(user);
    await chooseGrowthForm(user, strings.SHRUB);
    await fill(user, [40]);
    const submit = screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB });
    await user.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());

    releaseUpdate(1);

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(submit).toBeDisabled();
  });

  it('records the flags set while adding, against the plant and against its species', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await fill(user, [12, 1.3, 8]);

    await setDraftFlag(user, 'isDead', strings.YES);
    await setDraftFlag(user, 'isInvasive', strings.YES);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'CreateRecordedTree',
          speciesId: ABUTILON.id,
          treeGrowthForm: 'Tree',
          isDead: true,
          diameterAtBreastHeight: 12,
          pointOfMeasurement: 1.3,
          height: 8,
        },
        { type: 'BiomassSpecies', speciesId: ABUTILON.id, isInvasive: true },
      ],
    });
  });

  it('starts the new plant from what the plot already records about its species', async () => {
    const { user } = setupTrunks({ speciesId: ABUTILON.id, isInvasive: true, isThreatened: false, trunkCount: 1 });
    await startAdd(user);

    expect(draftSelect(1)).toHaveTextContent(strings.YES);
    expect(draftSelect(2)).toHaveTextContent(strings.NO);
    expect(draftSelect(3)).toHaveTextContent(strings.NO);
  });

  it('does not record a flag against a species the draft no longer names', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await setDraftFlag(user, 'isInvasive', strings.YES);

    await pickDraftSpecies(user, ACACIA.scientificName);
    await fill(user, [12, 1.3, 8]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'CreateRecordedTree',
          speciesId: ACACIA.id,
          treeGrowthForm: 'Tree',
          isDead: false,
          diameterAtBreastHeight: 12,
          pointOfMeasurement: 1.3,
          height: 8,
        },
      ],
    });
  });

  it('keeps the plant marked dead when the species changes', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await chooseGrowthForm(user, strings.TREE);
    await setDraftFlag(user, 'isDead', strings.YES);

    await pickDraftSpecies(user, ACACIA.scientificName);
    await fill(user, [12, 1.3, 8]);
    await user.click(screen.getByRole('button', { name: strings.ADD_TREE_OR_SHRUB }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      updates: [
        {
          type: 'CreateRecordedTree',
          speciesId: ACACIA.id,
          treeGrowthForm: 'Tree',
          isDead: true,
          diameterAtBreastHeight: 12,
          pointOfMeasurement: 1.3,
          height: 8,
        },
      ],
    });
  });

  it('shows what the plot records about the newly named species, not the flags chosen for the old one', async () => {
    const { user } = setupTrunks({ speciesId: ACACIA.id, isInvasive: false, isThreatened: true, trunkCount: 1 });
    await startAdd(user);
    await setDraftFlag(user, 'isInvasive', strings.YES);

    await pickDraftSpecies(user, ACACIA.scientificName);

    expect(draftSelect(1)).toHaveTextContent(strings.NO);
    expect(draftSelect(2)).toHaveTextContent(strings.YES);
  });

  it('abandons the new plant when the add is cancelled', async () => {
    const { user, requests } = setupTrunks();
    await startAdd(user);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(requests).toHaveLength(0);
    expect(screen.queryByPlaceholderText(strings.SEARCH_SPECIES)).not.toBeInTheDocument();
  });
});
