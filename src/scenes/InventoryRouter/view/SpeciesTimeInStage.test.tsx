import React from 'react';

import { screen } from '@testing-library/react';

import { SpeciesStageTimePayload, SpeciesTimeInStagePayload } from 'src/queries/generated/nurserySummaries';
import SpeciesTimeInStage from 'src/scenes/InventoryRouter/view/SpeciesTimeInStage';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

/** A stage with no average, as the API sends it: explicit nulls the generated type models as optional. */
const buildStageTime = (overrides: Partial<SpeciesStageTimePayload> = {}): SpeciesStageTimePayload => ({
  batchCount: 0,
  days: null as unknown as undefined,
  typicalMaxDays: null as unknown as undefined,
  typicalMinDays: null as unknown as undefined,
  typicalRangeBatchCount: 0,
  ...overrides,
});

const buildTimeInStage = (overrides: Partial<SpeciesTimeInStagePayload> = {}): SpeciesTimeInStagePayload => ({
  germinating: buildStageTime(),
  activeGrowth: buildStageTime(),
  hardeningOff: buildStageTime(),
  ready: buildStageTime(),
  ...overrides,
});

const renderCard = (averageTimeInStage: SpeciesTimeInStagePayload) =>
  renderWithProviders(<SpeciesTimeInStage averageTimeInStage={averageTimeInStage} />);

const daysText = (days: number) => strings.formatString(days === 1 ? strings.X_DAY : strings.X_DAYS, days).toString();

const rangeText = (min: number, max: number) => strings.formatString(strings.TYPICAL_X_TO_Y_DAYS, min, max).toString();

const batchesText = (batchCount: number) =>
  strings.formatString(batchCount === 1 ? strings.BASED_ON_X_BATCH : strings.BASED_ON_X_BATCHES, batchCount).toString();

/** Each segment names itself with its stage and value; the tooltip only describes it. */
const segmentFor = (stageLabel: string, valueText: string): HTMLElement =>
  screen.getByLabelText(`${stageLabel}: ${valueText}`);

describe('SpeciesTimeInStage', () => {
  it('shows the average alongside the typical range', () => {
    renderCard(
      buildTimeInStage({
        germinating: buildStageTime({ batchCount: 8, days: 21, typicalMinDays: 17, typicalMaxDays: 26 }),
      })
    );

    expect(segmentFor(strings.GERMINATING, `${daysText(21)} · ${rangeText(17, 26)}`)).toBeInTheDocument();
  });

  it('shows less than a day rather than zero days', () => {
    renderCard(buildTimeInStage({ hardeningOff: buildStageTime({ batchCount: 4, days: 0 }) }));

    expect(segmentFor(strings.HARDENING_OFF_SENTENCE_CASE, strings.LESS_THAN_ONE_DAY)).toBeInTheDocument();
    expect(screen.queryByText(daysText(0))).not.toBeInTheDocument();
  });

  it('shows a single day in the singular', () => {
    renderCard(buildTimeInStage({ activeGrowth: buildStageTime({ batchCount: 4, days: 1 }) }));

    expect(segmentFor(strings.ACTIVE_GROWTH_SENTENCE_CASE, daysText(1))).toBeInTheDocument();
  });

  it('leaves out a range whose ends are the same day', () => {
    renderCard(
      buildTimeInStage({
        ready: buildStageTime({ batchCount: 6, days: 3, typicalMinDays: 3, typicalMaxDays: 3 }),
      })
    );

    expect(segmentFor(strings.READY, daysText(3))).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(rangeText(3, 3)))).not.toBeInTheDocument();
  });

  it('says a range is still pending when the average has none', async () => {
    const { user } = renderCard(buildTimeInStage({ ready: buildStageTime({ batchCount: 4, days: 12 }) }));

    await user.hover(segmentFor(strings.READY, daysText(12)));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `${batchesText(4)} ${strings.SPECIES_TIME_IN_STAGE_RANGE_PENDING}`
    );
  });

  it('says only what the average covers once a range is shown', async () => {
    const { user } = renderCard(
      buildTimeInStage({
        activeGrowth: buildStageTime({ batchCount: 9, days: 30, typicalMinDays: 24, typicalMaxDays: 38 }),
      })
    );

    await user.hover(segmentFor(strings.ACTIVE_GROWTH_SENTENCE_CASE, `${daysText(30)} · ${rangeText(24, 38)}`));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(batchesText(9));
    expect(tooltip).not.toHaveTextContent(strings.SPECIES_TIME_IN_STAGE_RANGE_PENDING);
  });

  it('counts a single batch in the singular', async () => {
    const { user } = renderCard(buildTimeInStage({ germinating: buildStageTime({ batchCount: 1, days: 5 }) }));

    await user.hover(segmentFor(strings.GERMINATING, daysText(5)));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(batchesText(1));
  });

  it('opens the tooltip for a keyboard user', async () => {
    const { user } = renderCard(buildTimeInStage({ germinating: buildStageTime({ batchCount: 4, days: 7 }) }));

    await user.tab();

    expect(segmentFor(strings.GERMINATING, daysText(7))).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(batchesText(4));
  });

  it.each([
    ['no batches finished the stage', 0, () => strings.SPECIES_TIME_IN_STAGE_NO_BATCHES],
    ['only one batch finished the stage', 1, () => strings.SPECIES_TIME_IN_STAGE_ONLY_ONE_BATCH],
    [
      'too few batches finished the stage',
      2,
      () => strings.formatString(strings.SPECIES_TIME_IN_STAGE_ONLY_X_BATCHES, 2).toString(),
    ],
  ])('explains that there is not enough data when %s', async (_label, batchCount, shortfall) => {
    const { user } = renderCard(buildTimeInStage({ hardeningOff: buildStageTime({ batchCount }) }));

    const segment = segmentFor(strings.HARDENING_OFF_SENTENCE_CASE, strings.NOT_ENOUGH_DATA);
    await user.hover(segment);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      `${shortfall()} ${strings.SPECIES_TIME_IN_STAGE_MIN_BATCHES}`
    );
  });

  it('explains what the averages and the range cover', async () => {
    const { user } = renderCard(buildTimeInStage({ germinating: buildStageTime({ batchCount: 4, days: 7 }) }));

    expect(screen.getByText(strings.SPECIES_TIME_IN_STAGE_TITLE)).toBeInTheDocument();

    const tooltip = `${strings.SPECIES_TIME_IN_STAGE_TITLE_TOOLTIP} ${strings.SPECIES_TIME_IN_STAGE_TITLE_TOOLTIP_RANGE}`;
    await user.hover(screen.getByLabelText(tooltip));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(tooltip);
  });
});
