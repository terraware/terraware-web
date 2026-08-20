import { describe, expect, test } from '@rstest/core';

import {
  ProgressIndicator,
  compareRefIds,
  getFunderVisibleIndicators,
  getIndicatorCumulativeValue,
  getProgressIndicators,
  getPublishedProgressIndicators,
  getReportName,
  unpublishedPropertyList,
} from 'src/components/AcceleratorReports/utils';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { ILocalizedStrings } from 'src/strings';
import { strings as english } from 'src/strings/strings-en';

// these helpers only read keys, so the app's half of the table stands in for the whole thing
const strings = english as unknown as ILocalizedStrings;

const indicator = (overrides: Partial<ProgressIndicator> = {}): ProgressIndicator => ({
  classId: 'Not Cumulative',
  name: 'Trees Planted',
  refId: '1.1',
  ...overrides,
});

const acceleratorReport = (overrides: Partial<AcceleratorReportPayload> = {}) =>
  ({
    autoCalculatedIndicators: [],
    commonIndicators: [],
    endDate: '2026-06-30',
    projectIndicators: [],
    quarter: 'Q2',
    startDate: '2026-04-01',
    ...overrides,
  }) as AcceleratorReportPayload;

const publishedReport = (overrides: Partial<PublishedReportPayload> = {}) =>
  ({
    autoCalculatedIndicators: [],
    commonIndicators: [],
    endDate: '2026-06-30',
    projectIndicators: [],
    quarter: 'Q2',
    startDate: '2026-04-01',
    ...overrides,
  }) as PublishedReportPayload;

describe('getReportName', () => {
  test('joins the year and the quarter', () => {
    expect(getReportName(acceleratorReport())).toBe('2026-Q2');
  });

  test('falls back to the year alone for an annual report', () => {
    expect(getReportName(acceleratorReport({ quarter: undefined }))).toBe('2026');
  });
});

describe('compareRefIds', () => {
  test('compares each segment as a number rather than as text', () => {
    expect(compareRefIds('11.2', '11.10')).toBeLessThan(0);
    expect(compareRefIds('11.10', '11.2')).toBeGreaterThan(0);
    expect(compareRefIds('2.1', '11.1')).toBeLessThan(0);
  });

  test('treats equal ids as equal, and a missing segment as zero', () => {
    expect(compareRefIds('3.4', '3.4')).toBe(0);
    expect(compareRefIds('3', '3.1')).toBeLessThan(0);
  });

  test('sorts a list the way the progress section renders it', () => {
    expect(['11.10', '2.1', '11.2', '1.1'].sort(compareRefIds)).toEqual(['1.1', '2.1', '11.2', '11.10']);
  });
});

describe('getProgressIndicators', () => {
  test('tags each indicator with the class it came from', () => {
    const report = acceleratorReport({
      autoCalculatedIndicators: [{ indicator: 'Trees Planted', refId: '1.3', systemValue: 40 }],
      commonIndicators: [{ name: 'Standard one', refId: '1.1' }],
      projectIndicators: [{ name: 'Project one', refId: '1.2' }],
    } as unknown as Partial<AcceleratorReportPayload>);

    expect(getProgressIndicators(report).map(({ name, type }) => ({ name, type }))).toEqual([
      { name: 'Standard one', type: 'common' },
      { name: 'Project one', type: 'project' },
      { name: 'Trees Planted', type: 'autoCalculated' },
    ]);
  });

  test('names an auto-calculated indicator after the tracking value it reads', () => {
    const report = acceleratorReport({
      autoCalculatedIndicators: [{ indicator: 'Seeds Collected', refId: '1.1', systemValue: 10 }],
    } as unknown as Partial<AcceleratorReportPayload>);

    expect(getProgressIndicators(report)[0].name).toBe('Seeds Collected');
  });

  test('prefers a console override over the Terraware value', () => {
    const report = acceleratorReport({
      autoCalculatedIndicators: [{ indicator: 'Trees Planted', overrideValue: 12, refId: '1.1', systemValue: 40 }],
    } as unknown as Partial<AcceleratorReportPayload>);

    expect(getProgressIndicators(report)[0].value).toBe(12);
  });

  test('falls back to the Terraware value when nothing was overridden', () => {
    const report = acceleratorReport({
      autoCalculatedIndicators: [{ indicator: 'Trees Planted', refId: '1.1', systemValue: 40 }],
    } as unknown as Partial<AcceleratorReportPayload>);

    expect(getProgressIndicators(report)[0].value).toBe(40);
  });

  test('orders by reference id numerically, whichever array an indicator came from', () => {
    const report = acceleratorReport({
      autoCalculatedIndicators: [{ indicator: 'Auto', refId: '2.1' }],
      commonIndicators: [{ name: 'Standard', refId: '11.10' }],
      projectIndicators: [{ name: 'Project', refId: '11.2' }],
    } as unknown as Partial<AcceleratorReportPayload>);

    expect(getProgressIndicators(report).map(({ refId }) => refId)).toEqual(['2.1', '11.2', '11.10']);
  });

  test('returns nothing for a report that has not loaded', () => {
    expect(getProgressIndicators(undefined)).toEqual([]);
  });
});

describe('getPublishedProgressIndicators', () => {
  test('tags each indicator with the array it arrived in', () => {
    const report = publishedReport({
      autoCalculatedIndicators: [{ name: 'Trees Planted', refId: '1.3', value: 40 }],
      commonIndicators: [{ name: 'Standard one', refId: '1.1' }],
      projectIndicators: [{ name: 'Project one', refId: '1.2' }],
    } as unknown as Partial<PublishedReportPayload>);

    expect(getPublishedProgressIndicators(report).map(({ name, type }) => ({ name, type }))).toEqual([
      { name: 'Standard one', type: 'common' },
      { name: 'Project one', type: 'project' },
      { name: 'Trees Planted', type: 'autoCalculated' },
    ]);
  });

  test('orders by reference id numerically, whichever array an indicator came from', () => {
    const report = publishedReport({
      autoCalculatedIndicators: [{ name: 'Auto', refId: '2.1' }],
      commonIndicators: [{ name: 'Standard', refId: '11.10' }],
      projectIndicators: [{ name: 'Project', refId: '11.2' }],
    } as unknown as Partial<PublishedReportPayload>);

    expect(getPublishedProgressIndicators(report).map(({ refId }) => refId)).toEqual(['2.1', '11.2', '11.10']);
  });

  test('returns nothing for a report that has not loaded', () => {
    expect(getPublishedProgressIndicators(undefined)).toEqual([]);
  });
});

describe('getFunderVisibleIndicators', () => {
  test('drops the indicators that never reach funders', () => {
    const report = acceleratorReport({
      commonIndicators: [
        { isPublishable: true, name: 'Shared', refId: '1.1' },
        { isPublishable: false, name: 'Internal', refId: '1.2' },
      ],
    } as unknown as Partial<AcceleratorReportPayload>);

    expect(getFunderVisibleIndicators(report).map(({ name }) => name)).toEqual(['Shared']);
  });
});

describe('getIndicatorCumulativeValue', () => {
  test('returns the quarter value for a non-cumulative indicator', () => {
    expect(getIndicatorCumulativeValue(indicator({ value: 12 }))).toBe(12);
  });

  test('accumulates a yearly indicator from zero, ignoring the baseline and prior total', () => {
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

  test('starts a lifetime indicator at zero when it has neither', () => {
    const lifetime = indicator({
      classId: 'Lifetime Cumulative',
      currentYearProgress: [{ quarter: 'Q1', value: 10 }],
      value: 10,
    });

    expect(getIndicatorCumulativeValue(lifetime)).toBe(10);
  });

  test('substitutes the progress it is handed, so an editor can preview the value being typed', () => {
    const yearly = indicator({
      classId: 'Yearly Cumulative',
      currentYearProgress: [{ quarter: 'Q1', value: 10 }],
      value: 10,
    });

    expect(
      getIndicatorCumulativeValue(yearly, [
        { quarter: 'Q1', value: 10 },
        { quarter: 'Q2', value: 99 },
      ])
    ).toBe(109);
  });
});

describe('unpublishedPropertyList', () => {
  test('names each unpublished section', () => {
    expect(unpublishedPropertyList(['highlights', 'challenges'], strings)).toBe(
      `${strings.HIGHLIGHTS}, ${strings.CHALLENGES}`
    );
  });

  test('falls back to the raw property when a new one has no label yet', () => {
    expect(unpublishedPropertyList(['somethingNew'], strings)).toBe('somethingNew');
  });

  test('is empty when nothing is unpublished', () => {
    expect(unpublishedPropertyList([], strings)).toBe('');
  });
});
