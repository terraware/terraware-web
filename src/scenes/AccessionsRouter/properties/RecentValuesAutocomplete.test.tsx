import React from 'react';

import { screen, within } from '@testing-library/react';
import { DateTime } from 'luxon';

import { RecentValue } from 'src/queries/search/accessions';
import RecentValuesAutocomplete from 'src/scenes/AccessionsRouter/properties/RecentValuesAutocomplete';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const ALL_LABEL = 'All Collectors';

const openOptions = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.click(screen.getByRole('combobox'));
  return screen.findAllByRole('option');
};

const optionText = (option: HTMLElement, value: string) => within(option).getByText(value);

describe('RecentValuesAutocomplete', () => {
  it('groups a long list into a Recent section (recency order) then the rest alphabetically', async () => {
    const values: RecentValue[] = [
      { value: 'Zara', lastUsed: DateTime.now().minus({ days: 2 }).toISO() ?? undefined },
      { value: 'Yosef' },
      { value: 'Xavier' },
      { value: 'Wendy' },
      { value: 'Victor' },
      { value: 'Bob' },
      { value: 'Alice' },
    ];

    const { user } = renderWithProviders(
      <RecentValuesAutocomplete id='collectors' onChange={() => undefined} values={values} allLabel={ALL_LABEL} />
    );

    const options = await openOptions(user);

    expect(screen.getByText(strings.RECENT)).toBeInTheDocument();
    expect(screen.getByText(ALL_LABEL)).toBeInTheDocument();

    expect(options).toHaveLength(7);
    optionText(options[0], 'Zara');
    optionText(options[1], 'Yosef');
    optionText(options[2], 'Xavier');
    optionText(options[3], 'Wendy');
    optionText(options[4], 'Victor');
    optionText(options[5], 'Alice');
    optionText(options[6], 'Bob');

    expect(within(options[0]).getByText(/ago/i)).toBeInTheDocument();
  });

  it('labels only recent items that have a lastUsed timestamp, and never items in the all section', async () => {
    const values: RecentValue[] = [
      { value: 'Zara', lastUsed: DateTime.now().minus({ days: 2 }).toISO() ?? undefined }, // recent, labeled
      { value: 'Yosef' }, // recent, no timestamp -> no label
      { value: 'Xavier', lastUsed: DateTime.now().minus({ weeks: 3 }).toISO() ?? undefined }, // recent, labeled
      { value: 'Wendy' },
      { value: 'Victor' },
      { value: 'Bob', lastUsed: DateTime.now().minus({ days: 1 }).toISO() ?? undefined }, // overflow -> all section
      { value: 'Alice' },
    ];

    const { user } = renderWithProviders(
      <RecentValuesAutocomplete id='collectors' onChange={() => undefined} values={values} allLabel={ALL_LABEL} />
    );

    const options = await openOptions(user);

    expect(within(options[0]).getByText(/ago/i)).toBeInTheDocument();
    expect(within(options[2]).getByText(/ago/i)).toBeInTheDocument();
    expect(within(options[1]).queryByText(/ago/i)).not.toBeInTheDocument();

    const bob = options.find((option) => within(option).queryByText('Bob'));
    expect(bob).toBeDefined();
    expect(within(bob as HTMLElement).queryByText(/ago/i)).not.toBeInTheDocument();
  });

  it('shows a flat alphabetical list with no section headers once the user has typed', async () => {
    const values: RecentValue[] = [
      { value: 'Zara' },
      { value: 'Yosef' },
      { value: 'Xavier' },
      { value: 'Victoria' },
      { value: 'Victor' },
      { value: 'Bob' },
      { value: 'Alice' },
    ];

    const { user } = renderWithProviders(
      <RecentValuesAutocomplete
        id='collectors'
        selected='vi'
        onChange={() => undefined}
        values={values}
        allLabel={ALL_LABEL}
      />
    );

    const options = await openOptions(user);

    expect(screen.queryByText(strings.RECENT)).not.toBeInTheDocument();
    expect(screen.queryByText(ALL_LABEL)).not.toBeInTheDocument();

    expect(options).toHaveLength(3);
    optionText(options[0], 'Victor');
    optionText(options[1], 'Victoria');
    optionText(options[2], 'Xavier');
  });

  it('shows a single flat list without headers when there are no more than five values', async () => {
    const values: RecentValue[] = [{ value: 'Zara' }, { value: 'Yosef' }, { value: 'Bob' }, { value: 'Alice' }];

    const { user } = renderWithProviders(
      <RecentValuesAutocomplete id='collectors' onChange={() => undefined} values={values} allLabel={ALL_LABEL} />
    );

    const options = await openOptions(user);

    expect(screen.queryByText(strings.RECENT)).not.toBeInTheDocument();
    expect(screen.queryByText(ALL_LABEL)).not.toBeInTheDocument();
    expect(options).toHaveLength(4);
  });
});
