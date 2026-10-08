import React from 'react';

import { screen } from '@testing-library/react';

import ObservationSubstratumSelector from 'src/scenes/ObservationsRouterV2/Schedule/ObservationSubstratumSelector';
import strings from 'src/strings';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders } from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;

const site = buildPlantingSite({
  strata: [
    buildStratum({
      id: 1,
      name: 'Ewe Highlands',
      numPermanentPlots: 7,
      numTemporaryPlots: 5,
      substrata: [buildSubstratum({ id: 11, name: 'North' }), buildSubstratum({ id: 12, name: 'South' })],
    }),
    buildStratum({
      id: 2,
      name: 'Okuta Range',
      numPermanentPlots: 6,
      numTemporaryPlots: 8,
      substrata: [buildSubstratum({ id: 21, name: 'North' }), buildSubstratum({ id: 22, name: 'South' })],
    }),
  ],
});

const renderSelector = () => {
  mockGet(SITE_URL, { site });

  return renderWithProviders(
    <ObservationSubstratumSelector onChangeSelectedSubstrata={() => undefined} plantingSiteId={PLANTING_SITE_ID} />
  );
};

const plotsAssigned = (total: number, temporary: number, permanent: number, oneStratum: boolean) => {
  const text = strings.formatString(
    oneStratum
      ? strings.SCHEDULE_OBSERVATION_PLOTS_ASSIGNED_STRATUM
      : strings.SCHEDULE_OBSERVATION_PLOTS_ASSIGNED_STRATA,
    strings.formatString(strings.X_PLOTS, total) as string,
    `${temporary}`,
    `${permanent}`
  ) as string;

  return (_: string, element: Element | null) => element?.tagName === 'P' && element.textContent === text;
};

describe('ObservationSubstratumSelector', () => {
  it('shows the permanent and temporary plot counts of each stratum', async () => {
    renderSelector();

    expect(await screen.findByText(strings.PERMANENT)).toBeInTheDocument();
    expect(screen.getByText(strings.TEMPORARY)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('totals the plots of a stratum once all of its substrata are selected', async () => {
    const { user } = renderSelector();

    await user.click(await screen.findByLabelText('Okuta Range'));

    expect(screen.getByText(plotsAssigned(14, 8, 6, true))).toBeInTheDocument();
  });

  it('adds up every fully selected stratum', async () => {
    const { user } = renderSelector();

    await user.click(await screen.findByLabelText(strings.SELECT_ALL));

    expect(screen.getByText(plotsAssigned(26, 13, 13, false))).toBeInTheDocument();
  });

  it('leaves a partially selected stratum out of the total and says why', async () => {
    const { user } = renderSelector();

    await user.click(await screen.findByLabelText(strings.SELECT_ALL));
    await user.click(screen.getAllByLabelText('South')[0]);

    expect(screen.getByText(plotsAssigned(14, 8, 6, true))).toBeInTheDocument();
    expect(
      screen.getByText(strings.formatString(strings.SCHEDULE_OBSERVATION_STRATUM_EXCLUDED, 'Ewe Highlands') as string)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        strings.formatString(strings.SCHEDULE_OBSERVATION_SELECT_ALL_SUBSTRATA, 'Ewe Highlands') as string
      )
    ).toBeInTheDocument();
  });

  it('shows no total before anything is selected', async () => {
    renderSelector();

    expect(await screen.findByLabelText('Ewe Highlands')).toBeInTheDocument();
    expect(screen.queryByText(plotsAssigned(0, 0, 0, false))).not.toBeInTheDocument();
  });
});
