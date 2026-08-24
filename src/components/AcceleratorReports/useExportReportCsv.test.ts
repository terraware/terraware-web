import { describe, expect, test } from '@rstest/core';

import {
  ReportCsvAudience,
  ReportCsvField,
  ReportCsvParams,
  getIndicatorCsvColumns,
  isLocalizedCsvValue,
  makeAchievementCsvRows,
  makeChallengeCsvRows,
  makeIndicatorCsvRows,
  makeReportCsvRows,
} from 'src/components/AcceleratorReports/useExportReportCsv';
import { ProgressIndicator } from 'src/components/AcceleratorReports/utils';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';

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

const params = (audience: ReportCsvAudience, overrides: Partial<ReportCsvParams> = {}): ReportCsvParams => ({
  audience,
  indicators: [],
  report: audience === 'funder' ? publishedReport : acceleratorReport,
  ...overrides,
});

const fieldsOf = (rows: { field: ReportCsvField }[]) => rows.map(({ field }) => field);

const valueOf = (rows: { field: ReportCsvField; value: unknown }[], field: ReportCsvField) =>
  rows.find((row) => row.field === field)?.value;

describe('makeReportCsvRows', () => {
  test('omits the review fields a funder never sees, even from a working report', () => {
    const fields = fieldsOf(makeReportCsvRows({ ...params('funder'), report: acceleratorReport }));

    expect(fields).toContain('highlights');
    expect(fields).not.toContain('status');
    expect(fields).not.toContain('feedback');
    expect(fields).not.toContain('internalComment');
    expect(fields).not.toContain('unpublishedChanges');
  });

  test('gives a participant the review state but not the console-only fields', () => {
    const rows = makeReportCsvRows(params('participant'));

    expect(fieldsOf(rows)).toContain('status');
    expect(valueOf(rows, 'feedback')).toBe('Please expand the highlights');
    expect(fieldsOf(rows)).not.toContain('internalComment');
    expect(fieldsOf(rows)).not.toContain('unpublishedChanges');
  });

  test('gives the console the internal comment and the unpublished section list', () => {
    const rows = makeReportCsvRows(params('console'));

    expect(valueOf(rows, 'internalComment')).toBe('Watch the burn rate');
    expect(valueOf(rows, 'unpublishedChanges')).toEqual({
      kind: 'reportSections',
      value: ['highlights', 'challenges'],
    });
  });

  test('leaves the status for the hook to render, flagged for the console wording', () => {
    expect(valueOf(makeReportCsvRows(params('console')), 'status')).toEqual({
      kind: 'reportStatus',
      isConsoleView: true,
      value: 'Approved',
    });

    expect(valueOf(makeReportCsvRows(params('participant')), 'status')).toEqual({
      kind: 'reportStatus',
      isConsoleView: false,
      value: 'Approved',
    });
  });

  test('leaves the reporting period for the hook to render in the reader locale', () => {
    const rows = makeReportCsvRows(params('participant'));

    expect(valueOf(rows, 'startDate')).toEqual({ kind: 'date', value: '2026-04-01' });
    expect(valueOf(rows, 'endDate')).toEqual({ kind: 'date', value: '2026-06-30' });
  });

  test('includes the project row only when a project name is known', () => {
    expect(valueOf(makeReportCsvRows({ ...params('funder'), projectName: 'Kaiholena' }), 'project')).toBe('Kaiholena');
    expect(fieldsOf(makeReportCsvRows(params('funder')))).not.toContain('project');
  });

  test('names the report by year and quarter', () => {
    expect(valueOf(makeReportCsvRows(params('participant')), 'report')).toBe('2026-Q2');
  });
});

describe('makeAchievementCsvRows', () => {
  test('writes one row per achievement', () => {
    expect(makeAchievementCsvRows(params('participant'))).toEqual([
      { achievement: 'Planted the first stratum' },
      { achievement: 'Hired two rangers' },
    ]);
  });

  test('is empty when there are no achievements', () => {
    const report = { ...acceleratorReport, achievements: [] };

    expect(makeAchievementCsvRows({ ...params('participant'), report })).toEqual([]);
  });
});

describe('makeChallengeCsvRows', () => {
  test('pairs each challenge with its mitigation plan', () => {
    expect(makeChallengeCsvRows(params('participant'))).toEqual([
      { challenge: 'Drought', mitigationPlan: 'Drip irrigation' },
    ]);
  });

  test('is empty when there are no challenges', () => {
    const report = { ...acceleratorReport, challenges: [] };

    expect(makeChallengeCsvRows({ ...params('participant'), report })).toEqual([]);
  });
});

describe('getIndicatorCsvColumns', () => {
  test('keeps the Terraware values out of a funder export', () => {
    expect(getIndicatorCsvColumns('funder')).not.toContain('systemValue');
    expect(getIndicatorCsvColumns('funder')).not.toContain('overrideValue');
    expect(getIndicatorCsvColumns('participant')).toContain('systemValue');
    expect(getIndicatorCsvColumns('participant')).toContain('overrideValue');
  });

  test('reports which indicators reach funders only in the console export', () => {
    expect(getIndicatorCsvColumns('console')).toContain('isPublishable');
    expect(getIndicatorCsvColumns('participant')).not.toContain('isPublishable');
    expect(getIndicatorCsvColumns('funder')).not.toContain('isPublishable');
  });

  test('opens every audience with the same identifying columns', () => {
    (['funder', 'participant', 'console'] as ReportCsvAudience[]).forEach((audience) => {
      expect(getIndicatorCsvColumns(audience).slice(0, 3)).toEqual(['refId', 'name', 'type']);
    });
  });
});

describe('makeIndicatorCsvRows', () => {
  // ordering is `getProgressIndicators`' job, so the sheet just has to keep what it is handed
  test('keeps the order the view is rendering', () => {
    const indicators = [
      indicator({ name: 'Two', refId: '2.1' }),
      indicator({ name: 'Eleven two', refId: '11.2' }),
      indicator({ name: 'Eleven ten', refId: '11.10' }),
    ];

    expect(makeIndicatorCsvRows({ ...params('funder'), indicators }).map((row) => row.name)).toEqual([
      'Two',
      'Eleven two',
      'Eleven ten',
    ]);
  });

  test('spreads the year of progress across the quarter columns', () => {
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

    const [row] = makeIndicatorCsvRows({ ...params('funder'), indicators });

    expect(row.Q1).toBe(10);
    expect(row.Q2).toBe(15);
    expect(row.Q3).toBeUndefined();
    expect(row.Q4).toBeUndefined();
    expect(row.cumulativeValue).toBe(25);
  });

  test('rounds to the indicator precision, and leaves a precision-less value alone', () => {
    const indicators = [
      indicator({ name: 'Rounded', precision: 1, refId: '1.1', value: 12.345 }),
      indicator({ name: 'Raw', refId: '1.2', value: 12.345 }),
    ];

    expect(makeIndicatorCsvRows({ ...params('funder'), indicators }).map((row) => row.value)).toEqual([12.3, 12.345]);
  });

  test('leaves every enum cell for the hook to render', () => {
    const indicators = [
      indicator({ category: 'Climate', classId: 'Lifetime Cumulative', level: 'Outcome', status: 'On-Track' }),
    ];

    const [row] = makeIndicatorCsvRows({ ...params('funder'), indicators });

    expect(row.category).toEqual({ kind: 'indicatorCategory', value: 'Climate' });
    expect(row.classId).toEqual({ kind: 'indicatorClass', value: 'Lifetime Cumulative' });
    expect(row.level).toEqual({ kind: 'indicatorLevel', value: 'Outcome' });
    expect(row.status).toEqual({ kind: 'reportIndicatorStatus', value: 'On-Track' });
    expect(row.type).toEqual({ kind: 'indicatorType', value: 'common' });
  });

  test('records which class of indicator each row came from', () => {
    const indicators = [
      indicator({ refId: '1.1', type: 'autoCalculated' }),
      indicator({ refId: '1.2', type: 'common' }),
      indicator({ refId: '1.3', type: 'project' }),
    ];

    expect(makeIndicatorCsvRows({ ...params('funder'), indicators }).map((row) => row.type)).toEqual([
      { kind: 'indicatorType', value: 'autoCalculated' },
      { kind: 'indicatorType', value: 'common' },
      { kind: 'indicatorType', value: 'project' },
    ]);
  });

  test('carries the free-text cells through untouched', () => {
    const indicators = [
      indicator({
        description: 'How many trees went in the ground',
        progressNotes: 'Ahead of plan',
        projectsComments: 'Rain helped',
        supportingDocumentUrl: 'https://example.org/evidence',
      }),
    ];

    const [row] = makeIndicatorCsvRows({ ...params('funder'), indicators });

    expect(row.description).toBe('How many trees went in the ground');
    expect(row.progressNotes).toBe('Ahead of plan');
    expect(row.projectsComments).toBe('Rain helped');
    expect(row.supportingDocumentUrl).toBe('https://example.org/evidence');
  });
});

describe('isLocalizedCsvValue', () => {
  test('separates the cells that still need rendering from the ones that do not', () => {
    expect(isLocalizedCsvValue({ kind: 'date', value: '2026-04-01' })).toBe(true);
    expect(isLocalizedCsvValue('Kaiholena')).toBe(false);
    expect(isLocalizedCsvValue(12.5)).toBe(false);
    expect(isLocalizedCsvValue(undefined)).toBe(false);
  });
});
