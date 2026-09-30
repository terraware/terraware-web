import React from 'react';

import { screen } from '@testing-library/react';

import { NurseryWithdrawalPayload } from 'src/queries/generated/nurseryWithdrawals';
import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import strings from 'src/strings';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders } from 'src/test-utils';

import WithdrawalOverview from './WithdrawalOverview';

const withdrawal: NurseryWithdrawalPayload = {
  batchWithdrawals: [],
  facilityId: 1,
  id: 2,
  purpose: 'Out Plant',
  withdrawnDate: '2026-09-27',
};

const withdrawalSummary: SearchNurseryWithdrawalPayload = {
  hasReassignments: false,
  nurseryName: 'Green Valley Nursery',
  purpose: 'Out Plant',
  totalWithdrawn: 2,
  withdrawalId: withdrawal.id,
  withdrawnDate: withdrawal.withdrawnDate,
};

describe('WithdrawalOverview', () => {
  beforeEach(() => {
    mockGet('/api/v1/tracking/sites', { sites: [] });
  });

  it('preserves the original locations and shows the removed season and date after a site reassignment', async () => {
    mockGet('/api/v1/tracking/sites', {
      sites: [
        buildPlantingSite({
          id: 1,
          name: 'Original Site',
          strata: [
            buildStratum({
              name: 'Original Stratum',
              substrata: [buildSubstratum({ id: 10, name: 'Original Substratum' })],
            }),
          ],
        }),
        buildPlantingSite({
          id: 2,
          name: 'New Site',
          strata: [
            buildStratum({ name: 'New Stratum', substrata: [buildSubstratum({ id: 20, name: 'New Substratum' })] }),
          ],
        }),
      ],
    });
    renderWithProviders(
      <WithdrawalOverview
        withdrawal={withdrawal}
        withdrawalSummary={{ ...withdrawalSummary, plantingSeasonName: 'Fall 2026', plantingDate: '2026-10-15' }}
        delivery={{
          id: 1,
          plantingSiteId: 1,
          withdrawalId: 2,
          reassignmentDeliveryIds: [2],
          plantings: [{ id: 1, speciesId: 1, numPlants: 10, substratumId: 10, type: 'Delivery' }],
        }}
        reassignmentDeliveries={[
          {
            id: 2,
            plantingSiteId: 2,
            withdrawalId: 2,
            reassignmentDeliveryIds: [],
            plantings: [{ id: 2, speciesId: 1, numPlants: 10, substratumId: 20, type: 'Reassignment To' }],
          },
        ]}
      />
    );

    expect(
      await screen.findByText(strings.formatString(strings.REASSIGNED_VALUE, 'Original Site', 'New Site').toString())
    ).toBeInTheDocument();
    expect(
      screen.getByText(strings.formatString(strings.REASSIGNED_VALUE, 'Original Stratum', 'New Stratum').toString())
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        strings.formatString(strings.REASSIGNED_VALUE, 'Original Substratum', 'New Substratum').toString()
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(strings.formatString(strings.REASSIGNED_TO_NO_SEASON, 'Fall 2026').toString())
    ).toBeInTheDocument();
    expect(
      screen.getByText(strings.formatString(strings.REASSIGNED_TO_NO_DATE, '2026-10-15').toString())
    ).toBeInTheDocument();
  });
  it('does not show planting season fields for a withdrawal without a planting season', () => {
    renderWithProviders(<WithdrawalOverview withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />);

    expect(screen.queryByText(strings.PLANTING_SEASON)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.PLANTING_DATE)).not.toBeInTheDocument();
  });

  it('shows the planting season and date associated with a withdrawal', () => {
    renderWithProviders(
      <WithdrawalOverview
        withdrawal={{ ...withdrawal, plantingSeasonId: 3, scheduledPlantingDateRequestId: 4 }}
        withdrawalSummary={{
          ...withdrawalSummary,
          plantingSeasonName: 'Fall 2026',
          plantingDate: '2026-10-15',
        }}
      />
    );

    expect(screen.getByText(strings.PLANTING_SEASON)).toBeInTheDocument();
    expect(screen.getByText('Fall 2026')).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_DATE)).toBeInTheDocument();
    expect(screen.getByText('2026-10-15')).toBeInTheDocument();
  });

  it.each([
    ['has no planting date request', { ...withdrawal, plantingSeasonId: 3 }],
    [
      'has a planting date request whose date is unavailable',
      { ...withdrawal, plantingSeasonId: 3, scheduledPlantingDateRequestId: 4 },
    ],
  ])('shows a fallback when the withdrawal %s', (_description, withdrawalWithSeason) => {
    renderWithProviders(
      <WithdrawalOverview
        withdrawal={withdrawalWithSeason}
        withdrawalSummary={{ ...withdrawalSummary, plantingSeasonName: 'Fall 2026' }}
      />
    );

    expect(screen.getByText(strings.PLANTING_SEASON)).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_DATE)).toBeInTheDocument();
    expect(screen.getByText(strings.NOT_WITHDRAWN_TO_DATE)).toBeInTheDocument();
  });
});
