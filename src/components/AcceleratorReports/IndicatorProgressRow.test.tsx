import React from 'react';

import { screen, within } from '@testing-library/react';

import IndicatorProgressRow from 'src/components/AcceleratorReports/IndicatorProgressRow';
import { ProgressIndicator } from 'src/components/AcceleratorReports/utils';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const PERCENT_COMPLETE = '49%';

const indicator: ProgressIndicator = {
  classId: 'Not Cumulative',
  name: 'Hectares under restoration',
  refId: '1.1',
  target: 100,
  value: 49,
};

const lifetimeIndicator: ProgressIndicator = {
  baseline: 0,
  classId: 'Lifetime Cumulative',
  currentYearProgress: [{ quarter: 'Q1', value: 49 }],
  endOfProjectTarget: 200,
  name: 'Trees planted',
  refId: '1.2',
  target: 100,
};

const autoCalculatedIndicator: ProgressIndicator = {
  classId: 'Not Cumulative',
  name: 'Hectares planted',
  refId: '1.3',
  systemValue: 40,
  target: 100,
  type: 'autoCalculated',
};

const baselineOriginIndicator: ProgressIndicator = {
  baseline: 100,
  classId: 'Lifetime Cumulative',
  currentYearProgress: [{ quarter: 'Q1', value: 50 }],
  name: 'Trees planted',
  previousYearCumulativeTotal: 200,
  refId: '1.3',
  target: 400,
};

const noPreviousYearIndicator: ProgressIndicator = {
  baseline: 100,
  classId: 'Lifetime Cumulative',
  currentYearProgress: [{ quarter: 'Q1', value: 50 }],
  name: 'Trees planted',
  refId: '1.4',
  target: 400,
};

const completionLine = (template: string) => {
  const expected = template.replace('{0}', PERCENT_COMPLETE);
  return (_content: string, element: Element | null) => element?.textContent === expected;
};

describe('IndicatorProgressRow', () => {
  it('leaves the target completion percentage out of the collapsed row', () => {
    renderWithProviders(<IndicatorProgressRow indicator={indicator} />);

    expect(screen.queryByText(completionLine(strings.X_OF_YEAR_TARGET))).not.toBeInTheDocument();
  });

  it('shows the target completion percentage once the row is expanded', async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow indicator={indicator} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(completionLine(strings.X_OF_YEAR_TARGET))).toBeVisible();
  });

  it('shows the target completion percentage in print mode with nothing to expand', () => {
    renderWithProviders(<IndicatorProgressRow indicator={indicator} printMode />);

    expect(screen.getByText(completionLine(strings.X_OF_YEAR_TARGET))).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('describes a lifetime cumulative indicator against its cumulative target', async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow indicator={lifetimeIndicator} year={2026} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(completionLine(strings.X_OF_YEAR_CUMULATIVE_TARGET))).toBeVisible();
    expect(screen.queryByText(completionLine(strings.X_OF_YEAR_TARGET))).not.toBeInTheDocument();
  });

  it('keeps an auto-calculated value read-only for a project user', async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow editing indicator={autoCalculatedIndicator} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.queryByLabelText(strings.OVERWRITE_TERRAWARE_TRACKING_DATA)).not.toBeInTheDocument();
  });

  it('lets the console overwrite an auto-calculated value on request', async () => {
    const { user } = renderWithProviders(
      <IndicatorProgressRow editing indicator={autoCalculatedIndicator} isConsoleView />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('spinbutton')).toBeDisabled();

    const overwrite = screen.getByLabelText(strings.OVERWRITE_TERRAWARE_TRACKING_DATA);
    await user.click(within(overwrite).getByRole('button'));

    expect(screen.getByRole('spinbutton')).toBeEnabled();
  });

  it('leaves a reported indicator editable for a project user', async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow editing indicator={indicator} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('spinbutton')).toBeEnabled();
  });

  it('marks the previous year part of the way along a bar that opens at the baseline', () => {
    renderWithProviders(<IndicatorProgressRow indicator={baselineOriginIndicator} year={2026} />);

    const previousYearTick = screen.getByLabelText('2025');
    const left = Number.parseFloat(getComputedStyle(previousYearTick).left);

    expect(left).toBeCloseTo(33.33, 1);
  });

  it('leaves out the previous year mark when the indicator has no previous year total', () => {
    renderWithProviders(<IndicatorProgressRow indicator={noPreviousYearIndicator} year={2026} />);

    expect(screen.queryByLabelText('2025')).not.toBeInTheDocument();
  });
});
