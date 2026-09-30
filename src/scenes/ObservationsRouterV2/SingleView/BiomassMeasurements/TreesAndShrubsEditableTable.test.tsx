import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';

const UPDATE_URL = '/api/v1/tracking/observations/7/plots/9';

const setup = (treeGrowthForm = 'Tree') => {
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/tracking/observations/7/results', {
    observation: {
      id: 7,
      adHocPlot: { monitoringPlotId: 9 },
      biomassMeasurements: {
        forestType: 'Mangrove',
        trees: [
          {
            id: 11,
            treeNumber: 1,
            treeGrowthForm,
            speciesName: 'Acacia koa',
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
    await user.type(input, newValue);
    await user.tab();
  };
  return { user, requests, edit };
};

describe('TreesAndShrubsEditableTable', () => {
  it.each([
    ['Tree', '25', '101', 'diameterAtBreastHeight', 'DBH_CM'],
    ['Tree', '12', '50', 'height', 'HEIGHT_M'],
    ['Tree', '1.3', '3', 'pointOfMeasurement', 'POM_M'],
    ['Tree', '400', '1501', 'treeCrownDiameter', 'CROWN_DIAMETER_CM'],
    ['Shrub', '150', '301', 'shrubDiameter', 'CROWN_DIAMETER_CM'],
  ] as const)(
    'requires confirmation before saving unexpected %s %s → %s',
    async (growthForm, oldValue, value, field, label) => {
      const { user, requests, edit } = setup(growthForm);
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
});
