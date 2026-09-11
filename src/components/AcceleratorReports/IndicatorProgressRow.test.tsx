import React from 'react';

import { screen } from '@testing-library/react';

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
});
