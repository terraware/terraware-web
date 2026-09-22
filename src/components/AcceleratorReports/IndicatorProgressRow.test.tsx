import React from 'react';

import { screen, within } from '@testing-library/react';

import IndicatorProgressRow from 'src/components/AcceleratorReports/IndicatorProgressRow';
import { ProgressIndicator } from 'src/components/AcceleratorReports/utils';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const PERCENT_COMPLETE = '49%';
const PROJECTS_COMMENT = 'Second nursery came online in March.';
const PROGRESS_NOTE = 'Planting is ahead of schedule.';
const SUPPORTING_DOCUMENT_URL = 'https://example.com/restoration-plan.pdf';

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

const detailedIndicator: ProgressIndicator = {
  classId: 'Not Cumulative',
  name: 'Hectares under restoration',
  progressNotes: PROGRESS_NOTE,
  projectsComments: PROJECTS_COMMENT,
  refId: '1.4',
  supportingDocumentUrl: SUPPORTING_DOCUMENT_URL,
  target: 100,
  value: 49,
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

const decimalIndicator: ProgressIndicator = {
  classId: 'Not Cumulative',
  name: 'Seedling survival rate',
  refId: '1.5',
  target: 100,
  value: 84.7,
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

  it("hides the project's comments and the supporting document link in the funder report view", async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow funderReportView indicator={detailedIndicator} />);

    await user.click(screen.getByRole('button'));

    expect(screen.queryByText(strings.PROJECTS_COMMENTS)).not.toBeInTheDocument();
    expect(screen.queryByText(PROJECTS_COMMENT)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.LINK_TO_SUPPORTING_DOCUMENTS)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: strings.VIEW_DOCUMENTS })).not.toBeInTheDocument();

    expect(screen.getByText(strings.PROGRESS_NOTES)).toBeVisible();
    expect(screen.getByText(PROGRESS_NOTE)).toBeVisible();
  });

  it("shows the project's comments and the supporting document link outside the funder report view", async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow indicator={detailedIndicator} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(strings.PROJECTS_COMMENTS)).toBeVisible();
    expect(screen.getByText(PROJECTS_COMMENT)).toBeVisible();
    expect(screen.getByText(strings.LINK_TO_SUPPORTING_DOCUMENTS)).toBeVisible();
    expect(screen.getByRole('link', { name: strings.VIEW_DOCUMENTS })).toHaveAttribute('href', SUPPORTING_DOCUMENT_URL);
  });

  it('hides the progress notes in the project view', async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow indicator={detailedIndicator} />);

    await user.click(screen.getByRole('button'));

    expect(screen.queryByText(strings.PROGRESS_NOTES)).not.toBeInTheDocument();
    expect(screen.queryByText(PROGRESS_NOTE)).not.toBeInTheDocument();

    expect(screen.getByText(strings.PROJECTS_COMMENTS)).toBeVisible();
    expect(screen.getByText(PROJECTS_COMMENT)).toBeVisible();
  });

  it('shows the progress notes in the console view', async () => {
    const { user } = renderWithProviders(<IndicatorProgressRow indicator={detailedIndicator} isConsoleView />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(strings.PROGRESS_NOTES)).toBeVisible();
    expect(screen.getByText(PROGRESS_NOTE)).toBeVisible();
  });

  it('hides the progress notes when the project view prints the report', () => {
    renderWithProviders(<IndicatorProgressRow indicator={detailedIndicator} printMode />);

    expect(screen.getByText(detailedIndicator.name)).toBeVisible();

    expect(screen.queryByText(strings.PROGRESS_NOTES)).not.toBeInTheDocument();
    expect(screen.queryByText(PROGRESS_NOTE)).not.toBeInTheDocument();
  });

  it('shows the progress notes when the funder report is printed', () => {
    renderWithProviders(<IndicatorProgressRow funderReportView indicator={detailedIndicator} printMode />);

    expect(screen.getByText(strings.PROGRESS_NOTES)).toBeVisible();
    expect(screen.getByText(PROGRESS_NOTE)).toBeVisible();
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

  it('subdivides the bar into quarters while the target is out of reach', () => {
    renderWithProviders(<IndicatorProgressRow indicator={baselineOriginIndicator} year={2026} />);

    expect(screen.getByLabelText('Q1')).toBeInTheDocument();
    expect(screen.getByLabelText('2025')).toBeInTheDocument();
  });

  it('collapses the bar to a single segment once the target is surpassed', () => {
    renderWithProviders(<IndicatorProgressRow indicator={{ ...baselineOriginIndicator, target: 200 }} year={2026} />);

    expect(screen.queryByLabelText('Q1')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('2025')).not.toBeInTheDocument();
  });

  it('renders a value at the precision the indicator declares', () => {
    renderWithProviders(<IndicatorProgressRow indicator={{ ...decimalIndicator, precision: 1 }} />);

    expect(screen.getByText('84.7')).toBeVisible();
  });

  it('rounds a value to the precision the indicator declares', () => {
    renderWithProviders(<IndicatorProgressRow indicator={{ ...decimalIndicator, precision: 0 }} />);

    expect(screen.getByText('85')).toBeVisible();
    expect(screen.queryByText('84.7')).not.toBeInTheDocument();
  });
});
