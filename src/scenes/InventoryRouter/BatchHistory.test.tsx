import React from 'react';

import { rstest } from '@rstest/core';
import * as webComponents from '@terraware/web-components' with { rstest: 'importActual' };
import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { OrganizationUserPayload } from 'src/queries/generated/organizationUsers';
import BatchHistory from 'src/scenes/InventoryRouter/BatchHistory';
import strings from 'src/strings';
import { buildOrganization, mockGet, renderWithProviders } from 'src/test-utils';
import { BatchHistoryItem } from 'src/types/Batch';

// The photo carousel relies on browser APIs unavailable in jsdom; keep the photo it was handed.
rstest.mock('@terraware/web-components', () => ({
  ...webComponents,
  ViewPhotosDialog: ({ photos, title }: { photos: { url: string }[]; title: string }) => (
    <div role='dialog' aria-label={title}>
      <img src={photos[0].url} alt={title} />
    </div>
  ),
}));

const BATCH_ID = 7;
const ORGANIZATION_ID = 11;

const JENNIFER: OrganizationUserPayload = {
  id: 4,
  firstName: 'Jennifer',
  lastName: 'Yim',
  email: 'jennifer@terraware.io',
  role: 'Manager',
  addedTime: '2026-01-01T00:00:00Z',
};

const RAFAEL: OrganizationUserPayload = {
  id: 9,
  firstName: 'Rafael',
  lastName: 'Mendes',
  email: 'rafael@terraware.io',
  role: 'Admin',
  addedTime: '2026-01-01T00:00:00Z',
};

/** The batch's first quantities, recorded with no earlier event to compare against. */
const INITIAL_QUANTITIES: BatchHistoryItem = {
  type: 'QuantityEdited',
  version: 1,
  createdBy: JENNIFER.id,
  createdTime: '2026-01-10T08:00:00Z',
  germinatingQuantity: 5,
  activeGrowthQuantity: 0,
  hardeningOffQuantity: 0,
  notReadyQuantity: 0,
  readyQuantity: 0,
};

const READY_QUANTITY_EDITED: BatchHistoryItem = {
  type: 'QuantityEdited',
  version: 2,
  createdBy: RAFAEL.id,
  createdTime: '2026-02-05T09:30:00Z',
  germinatingQuantity: 5,
  activeGrowthQuantity: 0,
  hardeningOffQuantity: 0,
  notReadyQuantity: 0,
  notes: 'lost seedlings',
  readyQuantity: 12,
};

const PHOTO_CREATED: BatchHistoryItem = {
  type: 'PhotoCreated',
  version: 3,
  createdBy: JENNIFER.id,
  createdTime: '2026-03-01T10:00:00Z',
  fileId: 42,
};

/** Withdrawn the day before it was recorded, so the two dates in the row can't be confused. */
const WITHDRAWAL: BatchHistoryItem = {
  type: 'OutgoingWithdrawal',
  version: 4,
  createdBy: RAFAEL.id,
  createdTime: '2026-04-20T11:00:00Z',
  withdrawalId: 88,
  withdrawnDate: '2026-04-19',
  purpose: 'Out Plant',
  activeGrowthQuantityWithdrawn: 0,
  germinatingQuantityWithdrawn: 0,
  hardeningOffQuantity: 0,
  notReadyQuantityWithdrawn: 0,
  readyQuantityWithdrawn: 3,
};

/** Oldest first, the order the API returns. */
const HISTORY = [INITIAL_QUANTITIES, READY_QUANTITY_EDITED, PHOTO_CREATED, WITHDRAWAL];

const WITHDRAWAL_DESCRIPTION = strings.formatString(
  strings.BATCH_HISTORY_WITHDRAWAL_ON_DATE,
  '2026-04-19',
  strings.PLANTING
) as string;

const fieldsChanged = (...labels: string[]) => `${labels.join(', ')} ${strings.CHANGE}`;

const datePrefix = (date: string, user: OrganizationUserPayload) =>
  `${date} ${strings.BY} ${user.firstName} ${user.lastName}`;

/**
 * The left-hand column of every row, in the order the rows are shown. It is the only text each row
 * is guaranteed to have, so it doubles as a count of the rows on screen.
 */
const datePrefixes = (): HTMLElement[] =>
  screen.queryAllByText(
    (_content, element) =>
      element?.tagName === 'P' && new RegExp(`^\\d{4}-\\d{2}-\\d{2} ${strings.BY} `).test(element.textContent ?? '')
  );

/**
 * The row a date prefix belongs to: the nearest ancestor that holds the description as well, so
 * the prefix and the description can be checked against each other.
 */
const rowOf = (datePrefixElement: HTMLElement): HTMLElement => {
  let element = datePrefixElement.parentElement;
  while (element && element.textContent === datePrefixElement.textContent) {
    element = element.parentElement;
  }
  if (!element) {
    throw new Error(`No row around "${datePrefixElement.textContent}"`);
  }
  return element;
};

const renderHistory = async (props: Partial<React.ComponentProps<typeof BatchHistory>> = {}) => {
  mockGet(`/api/v1/nursery/batches/${BATCH_ID}/history`, { history: HISTORY });
  mockGet(`/api/v1/organizations/${ORGANIZATION_ID}/users`, { users: [JENNIFER, RAFAEL] });

  const rendered = renderWithProviders(<BatchHistory batchId={BATCH_ID} {...props} />, {
    organization: { selectedOrganization: buildOrganization({ id: ORGANIZATION_ID }) },
  });
  await screen.findByText(WITHDRAWAL_DESCRIPTION);
  return rendered;
};

const search = async (user: UserEvent, term: string) => user.type(screen.getByPlaceholderText(strings.SEARCH), term);

describe('BatchHistory', () => {
  it('lists the batch history newest first, naming who made each change', async () => {
    await renderHistory();

    expect(datePrefixes().map((element) => element.textContent)).toEqual([
      datePrefix('2026-04-20', RAFAEL),
      datePrefix('2026-03-01', JENNIFER),
      datePrefix('2026-02-05', RAFAEL),
      datePrefix('2026-01-10', JENNIFER),
    ]);

    const rows = datePrefixes().map(rowOf);
    expect(rows[0]).toHaveTextContent(WITHDRAWAL_DESCRIPTION);
    expect(rows[1]).toHaveTextContent(strings.PHOTO_ADDED);
    expect(rows[2]).toHaveTextContent(fieldsChanged(strings.READY_TO_PLANT_QUANTITY));
    expect(rows[3]).toHaveTextContent(
      fieldsChanged(
        strings.GERMINATION_ESTABLISHMENT_QUANTITY,
        strings.ACTIVE_GROWTH_QUANTITY,
        strings.HARDENING_OFF_QUANTITY,
        strings.READY_TO_PLANT_QUANTITY
      )
    );
  });

  it('links a withdrawal to the withdrawal it records', async () => {
    await renderHistory();

    expect(screen.getByRole('link', { name: WITHDRAWAL_DESCRIPTION })).toHaveAttribute(
      'href',
      '/nursery/withdrawals/88'
    );
  });

  it('opens the photo a history entry recorded', async () => {
    const { user } = await renderHistory();

    await user.click(screen.getByRole('button', { name: strings.PHOTO_ADDED }));

    const dialog = await screen.findByRole('dialog', { name: strings.PHOTOS });
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', `/api/v1/nursery/batches/${BATCH_ID}/photos/42`);
  });

  it('attributes the quantities the batch was created with to the accession it came from', async () => {
    await renderHistory({ accessions: [{ accessionId: 5, accessionNumber: 'ACC-001' }] });

    const creationRow = rowOf(datePrefixes()[3]);
    expect(creationRow).toHaveTextContent(
      strings.formatString(strings.BATCH_QUANTITY_UPDATED_FROM_ACCESSION, 'ACC-001') as string
    );
    expect(within(creationRow).getByRole('link', { name: 'ACC-001' })).toHaveAttribute('href', '/accessions/5');
  });

  it('narrows the list to the events whose description matches the search', async () => {
    const { user } = await renderHistory();

    await search(user, strings.PHOTO_ADDED.toUpperCase());

    expect(datePrefixes().map((element) => element.textContent)).toEqual([datePrefix('2026-03-01', JENNIFER)]);
    expect(screen.queryByText(WITHDRAWAL_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('opens the event details of a quantity change from its description', async () => {
    const { user } = await renderHistory();

    await user.click(screen.getByRole('button', { name: fieldsChanged(strings.READY_TO_PLANT_QUANTITY) }));

    expect(await screen.findByText(strings.EVENT_DETAILS)).toBeVisible();
    // The quantity this event moved, which the row itself never shows.
    expect(screen.getByText(strings.READY_TO_PLANT_QUANTITY_BEFORE).parentElement).toHaveTextContent('0');
    expect(screen.getByText(strings.READY_TO_PLANT_QUANTITY_AFTER).parentElement).toHaveTextContent('12');
  });

  it('narrows the list by a quantity note, which only the row itself shows', async () => {
    const { user } = await renderHistory();

    await search(user, 'lost seedlings');

    expect(datePrefixes().map((element) => element.textContent)).toEqual([datePrefix('2026-02-05', RAFAEL)]);
  });

  it('narrows the list to the events edited by the person searched for', async () => {
    const { user } = await renderHistory();

    await search(user, 'rafael');

    expect(datePrefixes().map((element) => element.textContent)).toEqual([
      datePrefix('2026-04-20', RAFAEL),
      datePrefix('2026-02-05', RAFAEL),
    ]);
  });

  it('says there is no history when nothing matches the search', async () => {
    const { user } = await renderHistory();

    // A kind of event this batch has none of.
    await search(user, strings.PHOTO_DELETED);

    expect(screen.getByText(strings.BATCH_HISTORY_NO_EVENTS)).toBeInTheDocument();
    expect(datePrefixes()).toHaveLength(0);
  });
});
