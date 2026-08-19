import { describe, expect, test } from '@rstest/core';

import { ProgressIndicator, getIndicatorCumulativeValue } from 'src/components/AcceleratorReports/utils';
import {
  ReportCsvAudience,
  makeAchievementsCsv,
  makeChallengesCsv,
  makeIndicatorsCsv,
  makeReportCsv,
} from 'src/components/AcceleratorReports/useExportReportCsv';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { strings as english } from 'src/strings/strings-en';
import { ILocalizedStrings } from 'src/strings';

// the CSV builders only read keys, so the app's half of the table stands in for the whole thing
const strings = english as unknown as ILocalizedStrings;

const acceleratorReport: AcceleratorReportPayload = {
  achievements: ['Planted the first stratum', 'Hired two rangers'],
  additionalComments: 'Nothing further',
  autoCalculatedIndicators: [],
  challenges: [{ challenge: 'Drought', mitigationPlan: 'Drip irrigation' }],
  commonIndicators: [],
  endDate: '2026-06-30',
  feedback: 'Please expand the highlights',
  financialSummaries: 'On budget',
  highlights: 'A strong quarter',
  id: 7,
  internalComment: 'Watch the burn rate',
  modifiedBy: 1,
  modifiedByUser: { fullName: 'Ada Lovelace', userId: 1 },
  modifiedTime: '2026-07-01T00:00:00Z',
  photos: [],
  projectId: 3,
  projectIndicators: [],
  quarter: 'Q2',
  startDate: '2026-04-01',
  status: 'Approved',
  unpublishedProperties: ['highlights', 'challenges'],
};

const publishedReport: PublishedReportPayload = {
  achievements: ['Planted the first stratum'],
  additionalComments: 'Nothing further',
  autoCalculatedIndicators: [],
  challenges: [{ challenge: 'Drought', mitigationPlan: 'Drip irrigation' }],
  commonIndicators: [],
  endDate: '2026-06-30',
  financialSummaries: 'On budget',
  highlights: 'A strong quarter',
  photos: [],
  projectId: 3,
  projectIndicators: [],
  projectName: 'Kaiholena',
  publishedBy: 1,
  publishedTime: '2026-07-01T00:00:00Z',
  quarter: 'Q2',
  reportId: 7,
  startDate: '2026-04-01',
};

const indicator = (overrides: Partial<ProgressIndicator> = {}): ProgressIndicator => ({
  category: 'Climate',
  classId: 'Not Cumulative',
  level: 'Output',
  name: 'Trees Planted',
  refId: '1.1',
  type: 'common',
  unit: 'trees',
  ...overrides,
});

const params = (audience: ReportCsvAudience, overrides: Partial<Parameters<typeof makeReportCsv>[0]> = {}) => ({
  audience,
  indicators: [] as ProgressIndicator[],
  report: audience === 'funder' ? publishedReport : acceleratorReport,
  ...overrides,
});

// jsdom's Blob has no text(), so read it the way a browser without that method would
const blobText = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).replace(/^\ufeff/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

const rows = async (blob: Blob) => (await blobText(blob)).trim().split('\r\n');

describe('makeReportCsv', () => {
  test('omits the review fields a funder never sees, even from a working report', async () => {
    const text = await blobText(makeReportCsv(
      { ...params('funder'), report: acceleratorReport, projectName: 'Kaiholena' },
      strings
    ));

    expect(text).toContain(strings.HIGHLIGHTS);
    expect(text).not.toContain(strings.STATUS);
    expect(text).not.toContain(strings.FEEDBACK);
    expect(text).not.toContain(strings.INTERNAL_COMMENT);
    expect(text).not.toContain(strings.UNPUBLISHED_CHANGES);
  });

  test('gives a participant the review state but not the console-only fields', async () => {
    const text = await blobText(makeReportCsv(params('participant'), strings));

    expect(text).toContain(strings.STATUS);
    expect(text).toContain('Approved');
    expect(text).toContain(strings.FEEDBACK);
    expect(text).toContain('Please expand the highlights');
    expect(text).not.toContain(strings.INTERNAL_COMMENT);
    expect(text).not.toContain(strings.UNPUBLISHED_CHANGES);
  });

  test('gives the console the internal comment and the unpublished section list', async () => {
    const text = await blobText(makeReportCsv(params('console'), strings));

    expect(text).toContain(strings.INTERNAL_COMMENT);
    expect(text).toContain('Watch the burn rate');
    expect(text).toContain(strings.UNPUBLISHED_CHANGES);
    expect(text).toContain(`${strings.HIGHLIGHTS}, ${strings.CHALLENGES}`);
  });

  test('includes the project row only when a project name is known', async () => {
    const withProject = await blobText(makeReportCsv({ ...params('funder'), projectName: 'Kaiholena' }, strings));
    const withoutProject = await blobText(makeReportCsv(params('funder'), strings));

    expect(withProject).toContain('Kaiholena');
    expect(withoutProject).not.toContain('Kaiholena');
  });
});

describe('makeAchievementsCsv', () => {
  test('writes one row per achievement', async () => {
    expect(await rows(makeAchievementsCsv(params('participant'), strings))).toEqual([
      `"${strings.ACHIEVEMENT}"`,
      '"Planted the first stratum"',
      '"Hired two rangers"',
    ]);
  });

  test('writes headers only when there are no achievements', async () => {
    const report = { ...acceleratorReport, achievements: [] };

    expect(await rows(makeAchievementsCsv({ ...params('participant'), report }, strings))).toEqual([
      `"${strings.ACHIEVEMENT}"`,
    ]);
  });
});

describe('makeChallengesCsv', () => {
  test('pairs each challenge with its mitigation plan', async () => {
    expect(await rows(makeChallengesCsv(params('participant'), strings))).toEqual([
      `"${strings.CHALLENGE}","${strings.MITIGATION_PLAN}"`,
      '"Drought","Drip irrigation"',
    ]);
  });

  test('writes headers only when there are no challenges', async () => {
    const report = { ...acceleratorReport, challenges: [] };

    expect(await rows(makeChallengesCsv({ ...params('participant'), report }, strings))).toEqual([
      `"${strings.CHALLENGE}","${strings.MITIGATION_PLAN}"`,
    ]);
  });
});

describe('makeIndicatorsCsv', () => {
  test('orders rows by reference id numerically rather than as text', async () => {
    const indicators = [
      indicator({ name: 'Eleven ten', refId: '11.10' }),
      indicator({ name: 'Eleven two', refId: '11.2' }),
      indicator({ name: 'Two', refId: '2.1' }),
    ];

    const [, ...dataRows] = await rows(makeIndicatorsCsv({ ...params('funder'), indicators }, strings));

    expect(dataRows.map((row) => row.split(',')[1])).toEqual(['"Two"', '"Eleven two"', '"Eleven ten"']);
  });

  test('spreads the year of progress across the quarter columns', async () => {
    const indicators = [
      indicator({
        classId: 'Yearly Cumulative',
        currentYearProgress: [
          { quarter: 'Q1', value: 10 },
          { quarter: 'Q2', value: 15 },
        ],
        value: 15,
      }),
    ];

    const [headerRow, dataRow] = await rows(makeIndicatorsCsv({ ...params('funder'), indicators }, strings));
    const columns = headerRow.split(',').map((column) => column.replace(/"/g, ''));
    const values = dataRow.split(',').map((value) => value.replace(/"/g, ''));
    const valueOf = (column: string) => values[columns.indexOf(column)];

    expect(valueOf('Q1')).toBe('10');
    expect(valueOf('Q2')).toBe('15');
    expect(valueOf('Q3')).toBe('');
    expect(valueOf('Q4')).toBe('');
    expect(valueOf(strings.CUMULATIVE_PROGRESS)).toBe('25');
  });

  test('rounds to the indicator precision, and leaves a precision-less value alone', async () => {
    const indicators = [
      indicator({ name: 'Rounded', precision: 1, refId: '1.1', value: 12.345 }),
      indicator({ name: 'Raw', refId: '1.2', value: 12.345 }),
    ];

    const text = await blobText(makeIndicatorsCsv({ ...params('funder'), indicators }, strings));

    expect(text).toContain('12.3');
    expect(text).toContain('12.345');
  });

  test('keeps the Terraware values out of a funder export', async () => {
    const indicators = [indicator({ overrideValue: 5, systemValue: 4, type: 'autoCalculated' })];

    const funderText = await blobText(makeIndicatorsCsv({ ...params('funder'), indicators }, strings));
    const participantText = await blobText(makeIndicatorsCsv({ ...params('participant'), indicators }, strings));

    expect(funderText).not.toContain(strings.TERRAWARE_VALUE);
    expect(funderText).not.toContain(strings.OVERWRITTEN_VALUE);
    expect(participantText).toContain(strings.TERRAWARE_VALUE);
    expect(participantText).toContain(strings.OVERWRITTEN_VALUE);
  });

  test('reports which indicators reach funders only in the console export', async () => {
    const indicators = [indicator({ isPublishable: true })];

    const consoleText = await blobText(makeIndicatorsCsv({ ...params('console'), indicators }, strings));
    const participantText = await blobText(makeIndicatorsCsv({ ...params('participant'), indicators }, strings));

    expect(consoleText).toContain(strings.SHARED_WITH_FUNDER);
    expect(participantText).not.toContain(strings.SHARED_WITH_FUNDER);
  });
});

describe('getIndicatorCumulativeValue', () => {
  test('returns the quarter value for a non-cumulative indicator', () => {
    expect(getIndicatorCumulativeValue(indicator({ value: 12 }))).toBe(12);
  });

  test('accumulates a yearly indicator from zero', () => {
    const yearly = indicator({
      baseline: 100,
      classId: 'Yearly Cumulative',
      currentYearProgress: [
        { quarter: 'Q1', value: 10 },
        { quarter: 'Q2', value: 15 },
      ],
      previousYearCumulativeTotal: 500,
      value: 15,
    });

    expect(getIndicatorCumulativeValue(yearly)).toBe(25);
  });

  test('falls back to the quarter value when a yearly indicator has no quarterly breakdown', () => {
    expect(getIndicatorCumulativeValue(indicator({ classId: 'Yearly Cumulative', value: 15 }))).toBe(15);
  });

  test('accumulates a lifetime indicator on top of the previous year total', () => {
    const lifetime = indicator({
      baseline: 100,
      classId: 'Lifetime Cumulative',
      currentYearProgress: [{ quarter: 'Q1', value: 10 }],
      previousYearCumulativeTotal: 500,
      value: 10,
    });

    expect(getIndicatorCumulativeValue(lifetime)).toBe(510);
  });

  test('falls back to the baseline when a lifetime indicator has no previous year total', () => {
    const lifetime = indicator({
      baseline: 100,
      classId: 'Lifetime Cumulative',
      currentYearProgress: [{ quarter: 'Q1', value: 10 }],
      value: 10,
    });

    expect(getIndicatorCumulativeValue(lifetime)).toBe(110);
  });
});
