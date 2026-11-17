import React from 'react';

import { screen, within } from '@testing-library/react';

import {
  type CreatedActionPayload,
  type DeletedActionPayload,
  type EventLogEntryPayload,
} from 'src/queries/generated/events';
import strings from 'src/strings';
import {
  buildAccession,
  buildOrganization,
  buildViabilityTest,
  dialogTitled,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';

import AccessionEventLog from './AccessionEventLog';

const ORG_ID = 1;
const ACCESSION_ID = 7;
const SEED_BANK_ID = 2;
const BATCH_ID = 720;
const NURSERY_WITHDRAWAL_ID = 491;
const OUT_PLANTING_WITHDRAWAL_ID = 492;
const OTHER_WITHDRAWAL_ID = 493;
const VIABILITY_TEST_WITHDRAWAL_ID = 494;
const VIABILITY_TEST_ID = 444222;
const DELETED_WITHDRAWAL_ID = 495;

const createdWith = (fields: Record<string, string>): CreatedActionPayload => ({
  type: 'Created',
  fields: Object.entries(fields).map(([fieldName, value]) => ({ fieldName, value: [value] })),
});

const deleted: DeletedActionPayload = { type: 'Deleted' };

const withdrawalEvent = (
  withdrawalId: number,
  action: EventLogEntryPayload['action'],
  subjectDeleted?: true
): EventLogEntryPayload => ({
  action,
  subject: {
    type: 'Withdrawal',
    accessionId: ACCESSION_ID,
    facilityId: SEED_BANK_ID,
    withdrawalId,
    fullText: `Withdrawal ${withdrawalId}`,
    shortText: 'Withdrawal',
    deleted: subjectDeleted,
  },
  timestamp: '2026-08-14T12:00:00Z',
  userId: 1,
  userName: 'Super Admin',
});

const mockEvents = (events: EventLogEntryPayload[]) => mockPost('/api/v1/events/list', { events });

/** The batch search that names the nursery a transfer went to. */
const mockBatchNurseries = (results: { id: string; facility_name: string }[] = []) =>
  mockPost('/api/v1/search', { results });

const renderLog = () => {
  mockGet(`/api/v2/seedbank/accessions/${ACCESSION_ID}`, { accession: buildAccession({ id: ACCESSION_ID }) });

  return renderWithProviders(<AccessionEventLog accessionId={ACCESSION_ID} />, {
    organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
  });
};

const hrefs = () => screen.getAllByRole('link').map((link) => link.getAttribute('href'));

describe('AccessionEventLog', () => {
  it('sends a nursery transfer to its withdrawal details page rather than to the batch it filled', async () => {
    mockEvents([
      withdrawalEvent(
        NURSERY_WITHDRAWAL_ID,
        createdWith({ withdrawnQuantity: '50 Seeds', purpose: 'Nursery', batchId: String(BATCH_ID) })
      ),
    ]);
    mockBatchNurseries([{ id: String(BATCH_ID), facility_name: 'Kigali Nursery' }]);

    renderLog();

    expect(await screen.findByRole('link', { name: /Kigali Nursery/ })).toHaveAttribute(
      'href',
      `/seeds/withdrawals/${NURSERY_WITHDRAWAL_ID}`
    );
    expect(hrefs()).not.toContain(`/inventory/batch/${BATCH_ID}`);
  });

  it('sends every other withdrawal purpose to its own withdrawal details page', async () => {
    mockEvents([
      withdrawalEvent(
        OUT_PLANTING_WITHDRAWAL_ID,
        createdWith({ withdrawnQuantity: '120 Seeds', purpose: 'Out-planting' })
      ),
      withdrawalEvent(OTHER_WITHDRAWAL_ID, createdWith({ withdrawnQuantity: '7 Seeds', purpose: 'Other' })),
    ]);
    mockBatchNurseries();

    renderLog();

    expect(await screen.findByRole('link', { name: /Out-planting/ })).toHaveAttribute(
      'href',
      `/seeds/withdrawals/${OUT_PLANTING_WITHDRAWAL_ID}`
    );
    expect(screen.getByRole('link', { name: /Other/ })).toHaveAttribute(
      'href',
      `/seeds/withdrawals/${OTHER_WITHDRAWAL_ID}`
    );
  });

  it('opens the viability test a withdrawal was made for instead of its details page', async () => {
    mockEvents([
      withdrawalEvent(
        VIABILITY_TEST_WITHDRAWAL_ID,
        createdWith({
          withdrawnQuantity: '25 Seeds',
          purpose: 'Viability Testing',
          viabilityTestId: String(VIABILITY_TEST_ID),
        })
      ),
    ]);
    mockBatchNurseries();
    mockGet(`/api/v2/seedbank/accessions/${ACCESSION_ID}/viabilityTests/${VIABILITY_TEST_ID}`, {
      viabilityTest: buildViabilityTest({
        accessionId: ACCESSION_ID,
        id: VIABILITY_TEST_ID,
        withdrawnByName: 'Ada Lovelace',
      }),
    });

    const { user } = renderLog();

    const row = await screen.findByRole('button', { name: /Viability Testing/ });
    expect(screen.queryByRole('link', { name: /Viability Testing/ })).not.toBeInTheDocument();

    await user.click(row);

    const title = strings.formatString(strings.VIABILITY_TEST_NUMBER, String(VIABILITY_TEST_ID)) as string;
    expect(await screen.findByText(title)).toBeVisible();
    expect(within(dialogTitled(title)).getByText('Ada Lovelace')).toBeVisible();
  });

  it('leaves a deleted withdrawal with nothing to open', async () => {
    mockEvents([withdrawalEvent(DELETED_WITHDRAWAL_ID, deleted, true)]);
    mockBatchNurseries();

    renderLog();

    expect(await screen.findByText(strings.ACCESSION_EVENT_WITHDRAWAL_DELETED)).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
