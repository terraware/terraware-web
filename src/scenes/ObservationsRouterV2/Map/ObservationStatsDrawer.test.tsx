import React from 'react';

import { screen, within } from '@testing-library/react';

import strings from 'src/strings';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders } from 'src/test-utils';

import ObservationStatsDrawer from './ObservationStatsDrawer';

const regions = [
  { layerId: 'sites', featureId: '1', combined: '3 / 5', permanent: '1 / 2', temporary: '2 / 3' },
  { layerId: 'strata', featureId: 'East', combined: '2 / 4', permanent: '1 / 2', temporary: '1 / 2' },
  { layerId: 'substrata', featureId: '11', combined: '2 / 3', permanent: '1 / 1', temporary: '1 / 2' },
];

const completedTime = '2026-06-02T12:00:00Z';
const plot = (monitoringPlotId: number, isPermanent: boolean, completed: boolean) => ({
  monitoringPlotId,
  monitoringPlotNumber: monitoringPlotId,
  isPermanent,
  completedTime: completed ? completedTime : undefined,
  status: completed ? 'Completed' : 'Unclaimed',
});

const renderDrawer = (
  type: 'Baseline Survey' | 'Monitoring' | 'Biomass Measurements',
  layerFeatureId: { layerId: string; featureId: string },
  empty = false
) => {
  mockGet('/api/v1/tracking/sites/1', {
    site: buildPlantingSite({
      strata: [buildStratum({ name: 'East', substrata: [buildSubstratum({ id: 11, name: 'East A' })] })],
    }),
  });
  mockGet('/api/v1/tracking/observations/7/results', {
    observation: {
      observationId: 7,
      plantingSiteId: 1,
      type,
      state: 'Completed',
      completedTime,
      strata: [
        {
          name: 'East',
          substrata: [
            {
              substratumId: 11,
              monitoringPlots: empty ? [] : [plot(1, true, true), plot(2, false, true), plot(3, false, false)],
            },
            { substratumId: 12, monitoringPlots: empty ? [] : [plot(4, true, false)] },
          ],
        },
        { name: 'West', substrata: [{ substratumId: 21, monitoringPlots: empty ? [] : [plot(5, false, true)] }] },
      ],
    },
  });
  return renderWithProviders(
    <ObservationStatsDrawer
      observationId={7}
      plantingSiteId={1}
      layerFeatureId={layerFeatureId}
      isBiomass={type !== 'Monitoring'}
    />
  );
};

describe('ObservationStatsDrawer plot counts', () => {
  it.each(regions)('combines observed and total Baseline plots for $layerId', async (region) => {
    renderDrawer('Baseline Survey', region);
    const row = await screen.findByRole('row', { name: `${strings.PLOTS} ${region.combined}` });
    expect(within(row).getByText(region.combined)).toBeVisible();
    expect(screen.queryByText(strings.PERMANENT_PLOTS)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.TEMPORARY_PLOTS)).not.toBeInTheDocument();
  });

  it.each(regions)('shows zero combined Baseline counts for empty $layerId', async (region) => {
    renderDrawer('Baseline Survey', region, true);
    expect(await screen.findByRole('row', { name: `${strings.PLOTS} 0 / 0` })).toBeVisible();
    expect(screen.queryByText(strings.PERMANENT_PLOTS)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.TEMPORARY_PLOTS)).not.toBeInTheDocument();
  });

  describe.each(['Monitoring', 'Biomass Measurements'] as const)('%s', (type) => {
    it.each(regions)('keeps separate plot counts for $layerId', async (region) => {
      renderDrawer(type, region);
      expect(await screen.findByRole('row', { name: `${strings.PERMANENT_PLOTS} ${region.permanent}` })).toBeVisible();
      expect(screen.getByRole('row', { name: `${strings.TEMPORARY_PLOTS} ${region.temporary}` })).toBeVisible();
      expect(screen.queryByText(strings.PLOTS)).not.toBeInTheDocument();
    });
  });

  it('does not add a combined count to an individual Baseline plot drawer', async () => {
    renderDrawer('Baseline Survey', { layerId: 'temporaryPlots', featureId: '2' });
    expect(await screen.findByRole('row', { name: `${strings.PLOT_TYPE} ${strings.TEMPORARY}` })).toBeVisible();
    expect(screen.queryByText(strings.PLOTS)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.PERMANENT_PLOTS)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.TEMPORARY_PLOTS)).not.toBeInTheDocument();
  });
});
