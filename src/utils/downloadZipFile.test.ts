import JSZip from 'jszip';

import { createZipFile } from './downloadZipFile';

describe('createZipFile', () => {
  test('preserves complete plot archives and CSV encoding inside a table archive', async () => {
    const csvFiles = [
      { fileName: 'Details', content: 'Plot,Name\n1,Árbol' },
      { fileName: 'Trees', content: () => Promise.resolve('Species,Diameter\nOak,12') },
      { fileName: 'Species', content: new Blob(['Name\nOak'], { type: 'text/csv' }) },
    ];
    const plotZip = await createZipFile({ dirName: 'Plot 1', files: csvFiles, suffix: '.csv' });
    const tableZip = await createZipFile({
      dirName: 'Site_Ad Hoc Biomass Monitoring plots_2026-09-29_filtered',
      files: [
        { fileName: 'Plot 1', content: plotZip },
        { fileName: 'Plot 2', content: () => Promise.resolve(plotZip) },
      ],
      suffix: '.zip',
    });

    const archive = await JSZip.loadAsync(tableZip);
    const nestedFiles = archive.file(/\.zip$/);
    expect(nestedFiles.map(({ name }) => name)).toEqual([
      'Site_Ad Hoc Biomass Monitoring plots_2026-09-29_filtered/Plot 1.zip',
      'Site_Ad Hoc Biomass Monitoring plots_2026-09-29_filtered/Plot 2.zip',
    ]);

    for (const nestedFile of nestedFiles) {
      const bytes = await nestedFile.async('uint8array');
      expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
      const plotArchive = await JSZip.loadAsync(bytes);
      expect(plotArchive.file(/\.csv$/).map(({ name }) => name).sort()).toEqual([
        'Plot 1/Details.csv',
        'Plot 1/Species.csv',
        'Plot 1/Trees.csv',
      ]);
      expect(await plotArchive.file('Plot 1/Details.csv')?.async('string')).toBe('\uFEFFPlot,Name\n1,Árbol');
      expect(await plotArchive.file('Plot 1/Trees.csv')?.async('string')).toBe('\uFEFFSpecies,Diameter\nOak,12');
      expect(await plotArchive.file('Plot 1/Species.csv')?.async('string')).toBe('\uFEFFName\nOak');
    }
  });

  test('sanitizes directory and file names', async () => {
    const archive = await JSZip.loadAsync(
      await createZipFile({
        dirName: 'Site:/Name',
        files: [{ fileName: 'Plot:*?1', content: 'data' }],
        suffix: '.csv',
      })
    );

    expect(archive.file(/\.csv$/).map(({ name }) => name)).toEqual(['SiteName/Plot1.csv']);
  });

  test('rejects the archive when file generation returns null', async () => {
    await expect(
      createZipFile({ dirName: 'Site', files: [{ fileName: 'Plot', content: () => Promise.resolve(null) }], suffix: '.zip' })
    ).rejects.toThrow('Failed to generate content for file "Plot.zip"');
  });

  test('propagates failures while generating a plot archive', async () => {
    const error = new Error('Plot download failed');
    await expect(
      createZipFile({
        dirName: 'Site',
        files: [{ fileName: 'Plot', content: () => Promise.reject(error) }],
        suffix: '.zip',
      })
    ).rejects.toBe(error);
  });
});
