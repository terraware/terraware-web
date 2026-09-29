import { rstest } from '@rstest/core';
import { renderHook } from '@testing-library/react';

import downloadZipFile from 'src/utils/downloadZipFile';

import useObservationExports from './useObservationExports';

const mocks = rstest.hoisted(() => ({
  observation: rstest.fn(),
  site: rstest.fn(),
  plots: rstest.fn(),
  species: rstest.fn(),
  trees: rstest.fn(),
}));

rstest.mock('src/providers', () => ({
  useLocalization: () => ({
    activeLocale: 'en',
    strings: {
      BIOMASS_OBSERVATION_FILENAME_PREFIX: 'Biomass Monitoring',
      PLOT: 'Plot',
      SPECIES_CLASSIFICATION: 'Species',
      TREES_AND_SHRUBS: 'Trees',
    },
  }),
  useOrganization: () => ({ selectedOrganization: { id: 1, timeZone: 'UTC' } }),
}));
rstest.mock('src/hooks/useOrganizationSpecies', () => ({ useOrganizationSpecies: () => ({ species: [] }) }));
rstest.mock('src/utils/useTimeZoneUtils', () => ({ useDefaultTimeZone: () => ({ get: () => ({ id: 'UTC' }) }) }));
rstest.mock('src/queries/generated/observations', () => ({
  useLazyGetObservationResultsQuery: () => [mocks.observation],
}));
rstest.mock('src/queries/generated/plantingSites', () => ({ useLazyGetPlantingSiteQuery: () => [mocks.site] }));
rstest.mock('src/queries/exports/observations', () => ({
  useLazyExportBiomassPlotsCsvQuery: () => [mocks.plots],
  useLazyExportBiomassSpeciesCsvQuery: () => [mocks.species],
  useLazyExportBiomassTreesShrubsCsvQuery: () => [mocks.trees],
  useLazyExportBiomassObservationsCsvQuery: () => [rstest.fn()],
  useLazyExportObservationGpxQuery: () => [rstest.fn()],
}));
rstest.mock('src/utils/downloadZipFile', () => ({ default: rstest.fn() }));

beforeEach(() => {
  rstest.resetAllMocks();
  mocks.observation.mockImplementation(({ observationId }: { observationId: number }) => ({
    unwrap: () => Promise.resolve({ observation: { plantingSiteId: 1, observationId, startDate: '2026-09-01' } }),
  }));
  mocks.site.mockReturnValue({ unwrap: () => Promise.resolve({ site: { name: 'Site' } }) });
  mocks.plots.mockImplementation((ids: number[]) => ({ unwrap: () => Promise.resolve(`plot ${ids.join(',')}`) }));
  mocks.species.mockImplementation((ids: number[]) => ({ unwrap: () => Promise.resolve(`species ${ids.join(',')}`) }));
  mocks.trees.mockImplementation((ids: number[]) => ({ unwrap: () => Promise.resolve(`trees ${ids.join(',')}`) }));
});

describe('downloadBiomassObservationsZip', () => {
  test('exports all filtered IDs in three bulk CSV requests without per-row lookups', async () => {
    const { result } = renderHook(useObservationExports);
    const ids = [9, 3, 8, 1, 7, 2, 6];
    await result.current.downloadBiomassObservationsZip(
      'Site',
      ids.map((observationId) => ({ observationId }))
    );

    for (const trigger of [mocks.plots, mocks.species, mocks.trees]) {
      expect(trigger).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveBeenCalledWith(ids, true);
    }
    expect(mocks.observation).not.toHaveBeenCalled();
    expect(mocks.site).not.toHaveBeenCalled();
    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    const archive = rstest.mocked(downloadZipFile).mock.calls[0][0];
    expect(archive.dirName).toMatch(/^Site_Ad Hoc Biomass Monitoring plots_\d{4}-\d{2}-\d{2}_filtered$/);
    expect(archive.suffix).toBe('.csv');
    expect(archive.files).toEqual([
      { fileName: expect.stringMatching(/-Plot$/), content: 'plot 9,3,8,1,7,2,6' },
      { fileName: expect.stringMatching(/-Species$/), content: 'species 9,3,8,1,7,2,6' },
      { fileName: expect.stringMatching(/-Trees$/), content: 'trees 9,3,8,1,7,2,6' },
    ]);
  });

  test('does not request or download files when the filtered table is empty', async () => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadBiomassObservationsZip('Site', []);

    for (const trigger of Object.values(mocks)) {
      expect(trigger).not.toHaveBeenCalled();
    }
    expect(downloadZipFile).not.toHaveBeenCalled();
  });

  test('does not download a partial archive when a bulk CSV request fails', async () => {
    const error = new Error('CSV export failed');
    mocks.species.mockReturnValue({ unwrap: () => Promise.reject(error) });
    const { result } = renderHook(useObservationExports);

    await expect(
      result.current.downloadBiomassObservationsZip('Site', [{ observationId: 1 }, { observationId: 2 }])
    ).rejects.toBe(error);
    expect(downloadZipFile).not.toHaveBeenCalled();
  });
});

describe('downloadBiomassObservationDetails', () => {
  test('keeps the individual observation export as three CSV files', async () => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadBiomassObservationDetails(42);

    for (const trigger of [mocks.plots, mocks.species, mocks.trees]) {
      expect(trigger).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveBeenCalledWith([42], true);
    }
    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    expect(downloadZipFile).toHaveBeenCalledWith({
      dirName: 'Site-2026-09-01-Biomass Monitoring',
      suffix: '.csv',
      files: [
        { fileName: 'Site-2026-09-01-Biomass Monitoring-Plot', content: 'plot 42' },
        { fileName: 'Site-2026-09-01-Biomass Monitoring-Species', content: 'species 42' },
        { fileName: 'Site-2026-09-01-Biomass Monitoring-Trees', content: 'trees 42' },
      ],
    });
  });
});
