import { rstest } from '@rstest/core';
import { renderHook } from '@testing-library/react';

import { AdHocObservationResults } from 'src/types/Observations';
import downloadZipFile from 'src/utils/downloadZipFile';

import useObservationExports from './useObservationExports';

const mocks = rstest.hoisted(() => ({
  observation: rstest.fn(),
  site: rstest.fn(),
  plots: rstest.fn(),
  species: rstest.fn(),
  trees: rstest.fn(),
  monitoringCsv: rstest.fn(),
  makeCsv: rstest.fn(),
  downloadCsv: rstest.fn(),
}));

rstest.mock('src/providers', () => ({
  useLocalization: () => ({
    activeLocale: 'en',
    strings: {
      BIOMASS_OBSERVATION_FILENAME_PREFIX: 'Biomass Monitoring',
      AD_HOC_PLOTS: 'Ad Hoc Plots',
      AD_HOC_PLANT_MONITORING: 'Plant Monitoring',
      BIOMASS_MONITORING: 'Biomass Monitoring',
      PLOT: 'Plot',
      SPECIES_CLASSIFICATION: 'Species',
      TREES_AND_SHRUBS: 'Trees',
    },
  }),
  useOrganization: () => ({ selectedOrganization: { id: 1, timeZone: 'UTC' } }),
}));
rstest.mock('src/hooks/useOrganizationSpecies', () => ({
  useOrganizationSpecies: () => ({
    species: [
      { id: 1, scientificName: 'First' },
      { id: 2, scientificName: 'Second' },
    ],
  }),
}));
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
rstest.mock('src/utils/csv', () => ({ makeCsv: mocks.makeCsv, downloadCsv: mocks.downloadCsv }));

rstest.mock('src/utils/downloadZipFile', () => ({ default: rstest.fn() }));

rstest.mock('./exportAdHocObservations', () => ({ makeAdHocObservationsCsv: mocks.monitoringCsv }));

beforeEach(() => {
  rstest.resetAllMocks();
  mocks.makeCsv.mockImplementation((_headers: unknown, rows: unknown) => new Blob([JSON.stringify(rows)]));
  mocks.monitoringCsv.mockReturnValue('monitoring CSV');
  mocks.observation.mockImplementation(({ observationId }: { observationId: number }) => ({
    unwrap: () => Promise.resolve({ observation: { plantingSiteId: 1, observationId, startDate: '2026-09-01' } }),
  }));
  mocks.site.mockReturnValue({ unwrap: () => Promise.resolve({ site: { name: 'Site' } }) });
  mocks.plots.mockImplementation((ids: number[]) => ({ unwrap: () => Promise.resolve(`plot ${ids.join(',')}`) }));
  mocks.species.mockImplementation((ids: number[]) => ({ unwrap: () => Promise.resolve(`species ${ids.join(',')}`) }));
  mocks.trees.mockImplementation((ids: number[]) => ({ unwrap: () => Promise.resolve(`trees ${ids.join(',')}`) }));
});

describe('downloadBiomassObservationsZip', () => {
  test.each([false, undefined])('omits the filtered suffix when hasFilters is %s', async (hasFilters) => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadBiomassObservationsZip('Site', [{ observationId: 7 }], hasFilters);

    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    expect(rstest.mocked(downloadZipFile).mock.calls[0][0].dirName).toMatch(
      /^Site_Ad Hoc Biomass Monitoring plots_\d{4}-\d{2}-\d{2}$/
    );
  });

  test('exports all filtered IDs in three bulk CSV requests without per-row lookups', async () => {
    const { result } = renderHook(useObservationExports);
    const ids = [9, 3, 8, 1, 7, 2, 6];
    await result.current.downloadBiomassObservationsZip(
      'Site',
      ids.map((observationId) => ({ observationId })),
      true
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

describe('downloadAdHocObservationsZip', () => {
  test.each([false, undefined])('omits the filtered suffix when hasFilters is %s', async (hasFilters) => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadAdHocObservationsZip({
      adHocObservationsResults: [],
      biomassObservationIds: [7],
      siteName: 'Site',
      hasFilters,
      plantingSitesById: {},
    });

    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    expect(rstest.mocked(downloadZipFile).mock.calls[0][0].dirName).toBe('Site-Ad Hoc Plots');
  });

  const monitoringResults = [{ observationId: 11 }] as AdHocObservationResults[];
  const biomassFiles = [
    { fileName: expect.stringMatching(/-Plot$/), content: 'plot 7,24' },
    { fileName: expect.stringMatching(/-Species$/), content: 'species 7,24' },
    { fileName: expect.stringMatching(/-Trees$/), content: 'trees 7,24' },
  ];
  const monitoringFile = { fileName: 'Site-Plant Monitoring', content: 'monitoring CSV' };

  test('exports mixed observations in three biomass CSVs and one monitoring CSV', async () => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadAdHocObservationsZip({
      adHocObservationsResults: monitoringResults,
      biomassObservationIds: [7, 24],
      siteName: 'Site',
      hasFilters: true,
      plantingSitesById: {},
    });

    for (const trigger of [mocks.plots, mocks.species, mocks.trees]) {
      expect(trigger).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveBeenCalledWith([7, 24], true);
    }
    expect(mocks.monitoringCsv).toHaveBeenCalledWith(monitoringResults, {});
    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    const archive = rstest.mocked(downloadZipFile).mock.calls[0][0];
    expect(archive.dirName).toBe('Site-Ad Hoc Plots_filtered');
    expect(archive.suffix).toBe('.csv');
    expect(archive.files).toHaveLength(4);
    expect(archive.files).toEqual(expect.arrayContaining([monitoringFile, ...biomassFiles]));
  });

  test('exports monitoring-only observations in one CSV without biomass requests', async () => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadAdHocObservationsZip({
      adHocObservationsResults: monitoringResults,
      biomassObservationIds: [],
      siteName: 'Site',
      hasFilters: true,
      plantingSitesById: {},
    });

    for (const trigger of [mocks.plots, mocks.species, mocks.trees]) {
      expect(trigger).not.toHaveBeenCalled();
    }
    expect(mocks.monitoringCsv).toHaveBeenCalledWith(monitoringResults, {});
    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    expect(downloadZipFile).toHaveBeenCalledWith({
      dirName: 'Site-Ad Hoc Plots_filtered',
      suffix: '.csv',
      files: [monitoringFile],
    });
  });

  test('exports biomass-only observations in three CSVs without a monitoring CSV', async () => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadAdHocObservationsZip({
      adHocObservationsResults: [],
      biomassObservationIds: [7, 24],
      siteName: 'Site',
      hasFilters: true,
      plantingSitesById: {},
    });

    for (const trigger of [mocks.plots, mocks.species, mocks.trees]) {
      expect(trigger).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveBeenCalledWith([7, 24], true);
    }
    expect(mocks.monitoringCsv).not.toHaveBeenCalled();
    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    expect(downloadZipFile).toHaveBeenCalledWith({
      dirName: 'Site-Ad Hoc Plots_filtered',
      suffix: '.csv',
      files: biomassFiles,
    });
  });

  test('does not request or download files when no observations are visible', async () => {
    const { result } = renderHook(useObservationExports);
    await result.current.downloadAdHocObservationsZip({
      adHocObservationsResults: [],
      biomassObservationIds: [],
      siteName: 'Site',
      hasFilters: true,
      plantingSitesById: {},
    });

    for (const trigger of Object.values(mocks)) {
      expect(trigger).not.toHaveBeenCalled();
    }
    expect(downloadZipFile).not.toHaveBeenCalled();
  });
});

describe('non-ad-hoc observation CSV sorting', () => {
  const makePlot = (monitoringPlotNumber: number) => ({
    monitoringPlotNumber,
    monitoringPlotId: monitoringPlotNumber,
    boundary: {
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    },
    photos: [],
    coordinates: [],
    conditions: [],
    status: 'Completed',
    species: [
      { speciesId: 2, totalDead: 0, totalExisting: 0, totalLive: 1 },
      { speciesId: 1, totalDead: 0, totalExisting: 0, totalLive: 2 },
    ],
  });

  const setUpObservation = () => {
    const observation = {
      observationId: 1,
      plantingSiteId: 1,
      startDate: '2026-09-01',
      strata: [
        {
          name: 'A',
          substrata: [
            { name: 'A1', monitoringPlots: [makePlot(2)] },
            { name: 'A2', monitoringPlots: [makePlot(100)] },
          ],
        },
        { name: 'B', substrata: [{ name: 'B1', monitoringPlots: [makePlot(10)] }] },
      ],
    };
    mocks.observation.mockReturnValue({ unwrap: () => Promise.resolve({ observation }) });
    return observation;
  };

  test('sorts observation and species CSVs globally by numeric plot number without mutating results', async () => {
    const observation = setUpObservation();
    const original = JSON.stringify(observation);
    const { result } = renderHook(useObservationExports);

    await result.current.downloadObservationResults(1);

    expect(mocks.makeCsv).toHaveBeenCalledTimes(2);
    const observationRows = mocks.makeCsv.mock.calls[0][1] as { monitoringPlotNumber: number }[];
    const speciesRows = mocks.makeCsv.mock.calls[1][1] as { monitoringPlot: number; scientificName: string }[];
    expect(observationRows.map(({ monitoringPlotNumber }) => monitoringPlotNumber)).toEqual([100, 10, 2]);
    expect(speciesRows.map(({ monitoringPlot, scientificName }) => [monitoringPlot, scientificName])).toEqual([
      [100, 'Second'],
      [100, 'First'],
      [10, 'Second'],
      [10, 'First'],
      [2, 'Second'],
      [2, 'First'],
    ]);
    expect(downloadZipFile).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(observation)).toBe(original);
  });

  test('sorts plot location CSV globally by numeric plot number without mutating results', async () => {
    const observation = setUpObservation();
    const original = JSON.stringify(observation);
    const { result } = renderHook(useObservationExports);

    await result.current.downloadObservationCsv(1);

    expect(mocks.makeCsv).toHaveBeenCalledTimes(1);
    const rows = mocks.makeCsv.mock.calls[0][1] as { monitoringPlotNumber: number }[];
    expect(rows.map(({ monitoringPlotNumber }) => monitoringPlotNumber)).toEqual([100, 10, 2]);
    expect(mocks.downloadCsv).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(observation)).toBe(original);
  });
});
