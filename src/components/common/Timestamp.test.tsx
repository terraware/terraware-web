import React from 'react';

import { screen } from '@testing-library/react';

import Timestamp from 'src/components/common/Timestamp';
import { buildUser, renderWithProviders } from 'src/test-utils';

const TIME_ZONES = [
  { id: 'America/Los_Angeles', longName: 'Pacific Time' },
  { id: 'Pacific/Honolulu', longName: 'Hawaii-Aleutian Time' },
];

// 2026-03-14T18:30:00Z is 11:30 in Los Angeles and 08:30 in Honolulu on the same date.
const ISO_STRING = '2026-03-14T18:30:00Z';

describe('Timestamp', () => {
  it('formats the timestamp in the time zone on the user profile', () => {
    renderWithProviders(<Timestamp isoString={ISO_STRING} />, {
      currentUser: { user: buildUser({ timeZone: 'America/Los_Angeles' }) },
      localization: { supportedTimeZones: TIME_ZONES },
    });

    expect(screen.getByText('March 14, 2026 at 11:30:00 AM')).toBeInTheDocument();
  });

  it('shifts the rendered time when the user is in a different time zone', () => {
    renderWithProviders(<Timestamp isoString={ISO_STRING} />, {
      currentUser: { user: buildUser({ timeZone: 'Pacific/Honolulu' }) },
      localization: { supportedTimeZones: TIME_ZONES },
    });

    expect(screen.getByText('March 14, 2026 at 8:30:00 AM')).toBeInTheDocument();
  });

  it('formats using the selected locale', () => {
    renderWithProviders(<Timestamp isoString={ISO_STRING} />, {
      currentUser: { user: buildUser({ timeZone: 'America/Los_Angeles' }) },
      localization: { selectedLocale: 'fr', supportedTimeZones: TIME_ZONES },
    });

    expect(screen.getByText('14 mars 2026 à 11:30:00')).toBeInTheDocument();
  });

  it('renders the gibberish locale as French so pseudo-localized builds keep real dates', () => {
    renderWithProviders(<Timestamp isoString={ISO_STRING} />, {
      currentUser: { user: buildUser({ timeZone: 'America/Los_Angeles' }) },
      localization: { selectedLocale: 'gx', supportedTimeZones: TIME_ZONES },
    });

    expect(screen.getByText('14 mars 2026 à 11:30:00')).toBeInTheDocument();
  });

  it('falls back to the system time zone when the profile time zone is not a known zone', () => {
    renderWithProviders(<Timestamp isoString={ISO_STRING} />, {
      currentUser: { user: buildUser({ timeZone: 'Mars/Olympus_Mons' }) },
      localization: { supportedTimeZones: TIME_ZONES },
    });

    // `yarn test` pins TZ to America/Los_Angeles, so the unresolved zone lands on the same output
    // as the Pacific case above — the point is that it renders rather than throwing.
    expect(screen.getByText('March 14, 2026 at 11:30:00 AM')).toBeInTheDocument();
  });
});
