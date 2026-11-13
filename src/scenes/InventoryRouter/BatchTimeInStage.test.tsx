import React from 'react';

import { screen, within } from '@testing-library/react';

import { BatchStageTimePayload, BatchTimeInStagePayload } from 'src/queries/generated/nurseryBatches';
import BatchTimeInStage from 'src/scenes/InventoryRouter/BatchTimeInStage';
import strings from 'src/strings';
import { buildBatch, renderWithProviders } from 'src/test-utils';
import { Batch } from 'src/types/Batch';

/**
 * A stage with no duration, as the API actually sends it: an explicit `days: null`, which the
 * generated type models only as optional.
 */
const buildStageTime = (overrides: Partial<BatchStageTimePayload> = {}): BatchStageTimePayload => ({
  cleared: false,
  countedQuantity: 0,
  days: null as unknown as undefined,
  inProgress: false,
  ...overrides,
});

const buildTimeInStage = (overrides: Partial<BatchTimeInStagePayload> = {}): BatchTimeInStagePayload => ({
  germinating: buildStageTime(),
  activeGrowth: buildStageTime(),
  hardeningOff: buildStageTime(),
  ready: buildStageTime(),
  ...overrides,
});

const renderCard = (timeInStage?: BatchTimeInStagePayload, batch: Partial<Batch> = {}) =>
  renderWithProviders(<BatchTimeInStage batch={buildBatch({ timeInStage, ...batch })} />);

/** A stage's value sits next to its label, which is the only accessible handle the segment has. */
const segmentFor = (stageLabel: string): HTMLElement => {
  const segment = screen.getByText(stageLabel).parentElement;
  if (!segment) {
    throw new Error(`No segment for "${stageLabel}"`);
  }
  return segment;
};

describe('BatchTimeInStage', () => {
  it('shows a completed stage as a number of days', () => {
    renderCard(buildTimeInStage({ germinating: buildStageTime({ days: 14 }) }));

    expect(
      within(segmentFor(strings.GERMINATING)).getByText(strings.formatString(strings.X_DAYS, 14).toString())
    ).toBeInTheDocument();
  });

  it('shows a single day in the singular', () => {
    renderCard(buildTimeInStage({ activeGrowth: buildStageTime({ days: 1 }) }));

    expect(
      within(segmentFor(strings.ACTIVE_GROWTH_SENTENCE_CASE)).getByText(
        strings.formatString(strings.X_DAY, 1).toString()
      )
    ).toBeInTheDocument();
  });

  it('shows less than a day rather than zero days', () => {
    renderCard(buildTimeInStage({ hardeningOff: buildStageTime({ days: 0 }) }));

    const segment = segmentFor(strings.HARDENING_OFF_SENTENCE_CASE);
    expect(within(segment).getByText(strings.LESS_THAN_ONE_DAY)).toBeInTheDocument();
    expect(within(segment).queryByText(strings.formatString(strings.X_DAYS, 0).toString())).not.toBeInTheDocument();
  });

  it('marks a stage seedlings are still in, and footnotes the card', () => {
    renderCard(buildTimeInStage({ ready: buildStageTime({ days: 9, inProgress: true }) }));

    const segment = segmentFor(strings.READY);
    expect(within(segment).getByText(strings.formatString(strings.X_DAYS, 9).toString())).toBeInTheDocument();
    expect(within(segment).getByText(`${strings.SO_FAR}*`)).toBeInTheDocument();
    expect(screen.getByText(strings.TIME_IN_STAGE_IN_PROGRESS_FOOTNOTE)).toBeInTheDocument();
  });

  it('leaves out the footnote when no stage is still in progress', () => {
    renderCard(buildTimeInStage({ ready: buildStageTime({ days: 9 }) }));

    expect(screen.queryByText(strings.TIME_IN_STAGE_IN_PROGRESS_FOOTNOTE)).not.toBeInTheDocument();
    expect(screen.queryByText(`${strings.SO_FAR}*`)).not.toBeInTheDocument();
  });

  it('explains that a hand-edited stage has no time to show', async () => {
    const { user } = renderCard(
      buildTimeInStage({ activeGrowth: buildStageTime({ cleared: true, days: null as unknown as undefined }) })
    );

    const segment = segmentFor(strings.ACTIVE_GROWTH_SENTENCE_CASE);
    expect(within(segment).getByText(strings.NOT_AVAILABLE)).toBeInTheDocument();

    await user.hover(within(segment).getByLabelText(strings.TIME_IN_STAGE_NOT_AVAILABLE_TOOLTIP));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(strings.TIME_IN_STAGE_NOT_AVAILABLE_TOOLTIP);
  });

  it.each([
    ['null', null as unknown as undefined],
    ['absent', undefined],
  ])('explains that a stage no seedlings went through does not apply when days is %s', async (_label, days) => {
    const { user } = renderCard(
      buildTimeInStage({ germinating: buildStageTime({ days: 3 }), ready: buildStageTime({ days }) })
    );

    const segment = segmentFor(strings.READY);
    expect(within(segment).getByText('—')).toBeInTheDocument();

    await user.hover(within(segment).getByLabelText(strings.TIME_IN_STAGE_NOT_APPLICABLE_TOOLTIP));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(strings.TIME_IN_STAGE_NOT_APPLICABLE_TOOLTIP);
  });

  it('explains what the averages cover', async () => {
    const { user } = renderCard(buildTimeInStage({ germinating: buildStageTime({ days: 3 }) }));

    expect(screen.getByText(strings.TIME_IN_STAGE_TITLE)).toBeInTheDocument();

    const tooltip = `${strings.TIME_IN_STAGE_TITLE_TOOLTIP} ${strings.TIME_IN_STAGE_TITLE_TOOLTIP_COUNTING}`;
    await user.hover(screen.getByLabelText(tooltip));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(tooltip);
  });

  it('says how many seedlings an average covers and how many are still in the stage', async () => {
    const { user } = renderCard(buildTimeInStage({ activeGrowth: buildStageTime({ days: 21, countedQuantity: 12 }) }), {
      activeGrowthQuantity: 4,
    });

    const counts = `${strings.formatString(strings.BASED_ON_X_SEEDLINGS, 12).toString()} ${strings
      .formatString(strings.X_STILL_IN_THIS_STAGE, 4)
      .toString()}`;

    await user.hover(within(segmentFor(strings.ACTIVE_GROWTH_SENTENCE_CASE)).getByLabelText(counts));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(counts);
  });

  it('counts a single seedling in the singular', async () => {
    const { user } = renderCard(buildTimeInStage({ ready: buildStageTime({ days: 6, countedQuantity: 1 }) }), {
      readyQuantity: 1,
    });

    const counts = `${strings.formatString(strings.BASED_ON_X_SEEDLING, 1).toString()} ${strings
      .formatString(strings.X_STILL_IN_THIS_STAGE, 1)
      .toString()}`;

    await user.hover(within(segmentFor(strings.READY)).getByLabelText(counts));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(counts);
  });

  /**
   * A stage with no average has nothing to count, so hovering it must surface only the reason it
   * has no value.
   */
  const expectNoCounts = async (stageTime: BatchStageTimePayload, value: string, reason: string) => {
    const { user } = renderCard(
      buildTimeInStage({ germinating: buildStageTime({ days: 3, countedQuantity: 8 }), ready: stageTime }),
      { readyQuantity: 11 }
    );

    const segment = segmentFor(strings.READY);
    const stillInStage = strings.formatString(strings.X_STILL_IN_THIS_STAGE, 11).toString();

    await user.hover(within(segment).getByText(value));
    await user.hover(within(segment).getByLabelText(reason));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(reason);
    expect(tooltip).not.toHaveTextContent(stillInStage);
    expect(screen.queryByText(stillInStage)).not.toBeInTheDocument();
  };

  it('offers no counts for a hand-edited stage, only the reason it has no value', async () => {
    await expectNoCounts(
      buildStageTime({ cleared: true }),
      strings.NOT_AVAILABLE,
      strings.TIME_IN_STAGE_NOT_AVAILABLE_TOOLTIP
    );
  });

  it('offers no counts for a stage no seedlings went through, only the reason it has no value', async () => {
    await expectNoCounts(buildStageTime(), '—', strings.TIME_IN_STAGE_NOT_APPLICABLE_TOOLTIP);
  });

  it.each([
    ['the batch has no time in stage at all', undefined],
    ['every stage reports null days', buildTimeInStage()],
    [
      'every stage omits days',
      buildTimeInStage({
        germinating: buildStageTime({ days: undefined }),
        activeGrowth: buildStageTime({ days: undefined }),
        hardeningOff: buildStageTime({ days: undefined }),
        ready: buildStageTime({ days: undefined }),
      }),
    ],
  ])('shows no card when %s', (_label, timeInStage) => {
    const { container } = renderCard(timeInStage);

    expect(screen.queryByText(strings.TIME_IN_STAGE_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.GERMINATING)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
