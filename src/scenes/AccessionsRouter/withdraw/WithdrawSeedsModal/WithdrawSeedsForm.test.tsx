import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import strings from 'src/strings';
import { buildOrganization, buildUser, captureRequests, mockGet, renderWithProviders, server } from 'src/test-utils';

import WithdrawSeedsForm from './WithdrawSeedsForm';
import { AccessionWithdrawInfo } from './types';

const ORG_USERS_URL = '/api/v1/organizations/1/users';
const NURSERY_TRANSFER_URL = '/api/v2/seedbank/accessions/:accessionId/transfers/nursery';
const WITHDRAWAL_URL = '/api/v2/seedbank/accessions/:accessionId/withdrawals';
const VIABILITY_URL = '/api/v2/seedbank/accessions/:accessionId/viabilityTests';
const BATCH_PHOTO_URL = '/api/v1/nursery/batches/:batchId/photos';

const buildWithdrawInfo = (overrides: Partial<AccessionWithdrawInfo> = {}): AccessionWithdrawInfo => ({
  id: 1,
  accessionNumber: 'ACC-001',
  scientificName: 'Acacia koa',
  // No speciesId on purpose: the inventory-batch search only fires when a species is known, so
  // leaving it off keeps the nursery flow from hitting /api/v1/search.
  facilityId: 101,
  remainingQuantity: { quantity: 100, units: 'Seeds' },
  estimatedCount: 100,
  estimatedWeight: { quantity: 50, units: 'Grams' },
  ...overrides,
});

const renderForm = (
  accessions: AccessionWithdrawInfo[],
  props: Partial<React.ComponentProps<typeof WithdrawSeedsForm>> = {}
) => {
  // Fired on mount by every render of the form; keep it mocked so the request is handled.
  mockGet(ORG_USERS_URL, { users: [] });
  return renderWithProviders(
    <WithdrawSeedsForm
      open
      onClose={props.onClose ?? (() => undefined)}
      accessions={accessions}
      user={buildUser()}
      onWithdrawn={props.onWithdrawn}
    />,
    { organization: { selectedOrganization: buildOrganization() } }
  );
};

describe('WithdrawSeedsForm', () => {
  describe('steps', () => {
    it('shows a photos step only for a nursery withdrawal', async () => {
      renderForm([buildWithdrawInfo()]);

      // Nursery is the default purpose, so all three steps are present.
      expect(await screen.findByText(strings.PURPOSE)).toBeInTheDocument();
      expect(screen.getByText(strings.QUANTITIES)).toBeInTheDocument();
      expect(screen.getByText(strings.PHOTOS)).toBeInTheDocument();
    });

    it('drops the photos step for a planting withdrawal', async () => {
      const { user } = renderForm([buildWithdrawInfo()]);

      await user.click(await screen.findByRole('radio', { name: strings.PLANTING }));

      expect(screen.getByText(strings.QUANTITIES)).toBeInTheDocument();
      expect(screen.queryByText(strings.PHOTOS)).not.toBeInTheDocument();
    });
  });

  describe('summary header', () => {
    it('names the species and lists a single accession number', async () => {
      renderForm([buildWithdrawInfo({ accessionNumber: 'ACC-001', scientificName: 'Acacia koa' })]);

      expect(await screen.findByText('Acacia koa')).toBeInTheDocument();
      expect(screen.getByText(strings.formatString(strings.X_ACCESSION, 1).toString())).toBeInTheDocument();
      expect(screen.getByText('ACC-001')).toBeInTheDocument();
    });

    it('counts and lists every accession number for a bulk withdrawal', async () => {
      renderForm([
        buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
        buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
      ]);

      expect(await screen.findByText(strings.formatString(strings.X_ACCESSIONS, 2).toString())).toBeInTheDocument();
      expect(screen.getByText('ACC-001')).toBeInTheDocument();
      expect(screen.getByText('ACC-002')).toBeInTheDocument();
    });
  });

  describe('viability testing availability', () => {
    it('disables viability testing for a bulk withdrawal and keeps the other purposes available', async () => {
      renderForm([
        buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
        buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
      ]);

      const viabilityRadio = await screen.findByRole('radio', { name: new RegExp(strings.VIABILITY_TESTING) });
      expect(viabilityRadio).toBeDisabled();

      // The other purposes stay available.
      expect(screen.getByRole('radio', { name: strings.NURSERY })).toBeEnabled();
      expect(screen.getByRole('radio', { name: strings.PLANTING })).toBeEnabled();
    });

    it('enables viability testing for a single accession', async () => {
      renderForm([buildWithdrawInfo()]);

      const viabilityRadio = await screen.findByRole('radio', { name: new RegExp(strings.VIABILITY_TESTING) });
      expect(viabilityRadio).toBeEnabled();
    });
  });

  describe('navigation', () => {
    it('closes without withdrawing when cancelled', async () => {
      const onClose = rs.fn();
      const { user } = renderForm([buildWithdrawInfo()], { onClose });

      await user.click(await screen.findByRole('button', { name: strings.CANCEL }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('steps forward to quantities and back to purpose', async () => {
      const { user } = renderForm([buildWithdrawInfo()]);

      // Purpose 0 -> Quantities 1 requires a nursery destination; switch to planting so Next is
      // enabled without one.
      await user.click(await screen.findByRole('radio', { name: strings.PLANTING }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));

      expect(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: strings.BACK }));

      expect(screen.getByRole('radio', { name: strings.PLANTING })).toBeInTheDocument();
    });
  });

  describe('submission', () => {
    it('creates one withdrawal per accession for a planting withdrawal', async () => {
      const onClose = rs.fn();
      const onWithdrawn = rs.fn();
      const requests = captureRequests('post', WITHDRAWAL_URL);
      const { user, store } = renderForm([buildWithdrawInfo()], { onClose, onWithdrawn });

      await user.click(await screen.findByRole('radio', { name: strings.PLANTING }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL }));
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(requests[0].url).toContain('/accessions/1/withdrawals');
      const body = (await requests[0].json()) as {
        purpose: string;
        withdrawnQuantity: { quantity: number; units: string };
      };
      expect(body.purpose).toBe('Out-planting');
      expect(body.withdrawnQuantity).toEqual({ quantity: 100, units: 'Seeds' });

      await waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(onWithdrawn).toHaveBeenCalledTimes(1);
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'success',
        msg: strings.ACCESSION_WITHDRAW_SUCCESS,
      });
    });

    it('creates one batch per species for a nursery withdrawal, reusing it across accessions', async () => {
      const onWithdrawn = rs.fn();
      const transfers = captureRequests('post', NURSERY_TRANSFER_URL, { batch: { id: 555 } });
      const photos = captureRequests('post', BATCH_PHOTO_URL);
      const { user } = renderForm(
        [
          buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
          buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
        ],
        { onWithdrawn }
      );

      // Pick the nursery destination so the purpose step can be completed.
      await screen.findByText(strings.PURPOSE);
      await user.click(document.querySelector('#destinationFacilityId') as Element);
      await user.click(await screen.findByText('Test Nursery'));

      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      await waitFor(() => expect(transfers).toHaveLength(2));
      const first = (await transfers[0].json()) as { batchId?: number };
      const second = (await transfers[1].json()) as { batchId?: number };
      expect(first.batchId).toBeUndefined();
      expect(second.batchId).toBe(555);

      await waitFor(() => expect(onWithdrawn).toHaveBeenCalled());
      // No photos were added, so nothing is posted to the batch.
      expect(photos).toHaveLength(0);
    });

    it('creates a viability test for a single accession', async () => {
      const requests = captureRequests('post', VIABILITY_URL);
      const { user } = renderForm([buildWithdrawInfo()]);

      await user.click(await screen.findByRole('radio', { name: new RegExp(strings.VIABILITY_TESTING) }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL }));
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(requests[0].url).toContain('/accessions/1/viabilityTests');
      const body = (await requests[0].json()) as { seedsTested: number };
      expect(body.seedsTested).toBe(100);
    });

    it('keeps the dialog open and reports which accessions failed on a partial failure', async () => {
      const onClose = rs.fn();
      // ACC-001 succeeds, ACC-002 fails.
      server.use(
        http.post('/api/v2/seedbank/accessions/1/withdrawals', () => HttpResponse.json({ status: 'ok' })),
        http.post('/api/v2/seedbank/accessions/2/withdrawals', () =>
          HttpResponse.json({ status: 'error', error: { message: 'nope' } }, { status: 500 })
        )
      );
      const { user, store } = renderForm(
        [
          buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
          buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
        ],
        { onClose }
      );

      await user.click(await screen.findByRole('radio', { name: strings.PLANTING }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL }));
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      await waitFor(() => {
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
      });
      expect(store.getState().snackbar.snackbars.toast?.msg).toContain('ACC-002');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('removes succeeded accessions after a partial failure so they cannot be withdrawn twice', async () => {
      const onWithdrawn = rs.fn();
      // ACC-001 succeeds, ACC-002 fails.
      server.use(
        http.post('/api/v2/seedbank/accessions/1/withdrawals', () => HttpResponse.json({ status: 'ok' })),
        http.post('/api/v2/seedbank/accessions/2/withdrawals', () =>
          HttpResponse.json({ status: 'error' }, { status: 500 })
        )
      );
      const { user } = renderForm(
        [
          buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
          buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
        ],
        { onWithdrawn }
      );

      await user.click(await screen.findByRole('radio', { name: strings.PLANTING }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL }));
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      // The succeeded accession is dropped from the flow; only the failed one remains, so it
      // cannot be resubmitted and withdrawn a second time.
      await waitFor(() => expect(screen.queryByText('ACC-001')).not.toBeInTheDocument());
      // ACC-002 still appears (in both the summary header and the quantities row).
      expect(screen.getAllByText('ACC-002').length).toBeGreaterThan(0);
      expect(screen.getByText(strings.formatString(strings.X_ACCESSION, 1).toString())).toBeInTheDocument();
      // The parent is refreshed for the accession that did go through.
      expect(onWithdrawn).toHaveBeenCalledTimes(1);
    });

    it('reports every unattempted nursery accession when an earlier transfer fails', async () => {
      const onWithdrawn = rs.fn();
      // The first transfer fails; the ordered loop then never attempts the second accession.
      server.use(
        http.post('/api/v2/seedbank/accessions/1/transfers/nursery', () =>
          HttpResponse.json({ status: 'error' }, { status: 500 })
        ),
        http.post('/api/v2/seedbank/accessions/2/transfers/nursery', () =>
          HttpResponse.json({ status: 'ok', batch: { id: 555 } })
        )
      );
      const { user, store } = renderForm(
        [
          buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
          buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
        ],
        { onWithdrawn }
      );

      await screen.findByText(strings.PURPOSE);
      await user.click(document.querySelector('#destinationFacilityId') as Element);
      await user.click(await screen.findByText('Test Nursery'));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('checkbox', { name: strings.WITHDRAW_ALL }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      await waitFor(() => {
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
      });
      const message = store.getState().snackbar.snackbars.toast?.msg ?? '';
      expect(message).toContain('ACC-001');
      // The unattempted accession is reported too, not silently discarded.
      expect(message).toContain('ACC-002');
      // Nothing was withdrawn, so the parent is not refreshed.
      expect(onWithdrawn).not.toHaveBeenCalled();
    });
  });

  describe('quantities validation', () => {
    it('keeps Withdraw disabled when a populated row has an invalid amount', async () => {
      const { user } = renderForm([
        buildWithdrawInfo({ id: 1, accessionNumber: 'ACC-001' }),
        buildWithdrawInfo({ id: 2, accessionNumber: 'ACC-002' }),
      ]);

      await user.click(await screen.findByRole('radio', { name: strings.PLANTING }));
      await user.click(screen.getByRole('button', { name: strings.NEXT }));

      const inputs = screen.getAllByRole('spinbutton');
      // A valid amount for one accession...
      await user.type(inputs[0], '10');
      // ...but a populated, invalid (zero) amount for the other must not be silently ignored.
      await user.type(inputs[1], '0');

      expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeDisabled();
    });
  });
});
