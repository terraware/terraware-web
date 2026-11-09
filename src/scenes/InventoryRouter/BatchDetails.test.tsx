import React from 'react';

import { act, screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { api } from 'src/queries/generated/nurseryBatches';
import BatchDetails from 'src/scenes/InventoryRouter/BatchDetails';
import InventoryBatchView from 'src/scenes/InventoryRouter/InventoryBatchView';
import strings from 'src/strings';
import { buildBatch, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';
import { server } from 'src/test-utils/msw/server';

const BATCH = buildBatch({ id: 7, germinatingQuantity: 5, activeGrowthQuantity: 10, hardeningOffQuantity: 3 });

const renderDetails = () => {
  mockGet(`/api/v1/nursery/batches/${BATCH.id}/photos`, { photos: [] });
  return renderWithProviders(<BatchDetails batch={BATCH} />);
};

/**
 * The edit button beside a quantity. It has no label of its own: its "Edit" tooltip lands on a
 * wrapping span, and every editable quantity has one, so it is found next to the quantity's title.
 */
const editButtonFor = (title: string): HTMLElement => {
  let card: HTMLElement | null = screen.getByText(title);
  while (card && within(card).queryAllByLabelText(strings.EDIT).length === 0) {
    card = card.parentElement;
  }
  if (!card) {
    throw new Error(`No edit button for "${title}"`);
  }
  return within(within(card).getByLabelText(strings.EDIT)).getByRole('button');
};

describe('BatchDetails', () => {
  it.each(['deleted', 'emptied', 'failed'] as const)(
    'refreshes cached detail and history when deletion is %s',
    async (outcome) => {
      let deleted = false;
      let detailRequests = 0;
      let historyRequests = 0;
      const emptyBatch = buildBatch({
        ...BATCH,
        germinatingQuantity: 0,
        activeGrowthQuantity: 0,
        hardeningOffQuantity: 0,
        readyQuantity: 0,
      });
      mockGet(`/api/v1/nursery/batches/${BATCH.id}/photos`, { photos: [] });
      mockGet('/api/v1/projects', { projects: [] });
      mockGet('/api/v1/species', { species: [] });
      mockGet(`/api/v1/facilities/${BATCH.facilityId}/subLocations`, { subLocations: [] });
      server.use(
        http.get(`/api/v1/nursery/batches/${BATCH.id}`, () => {
          detailRequests++;
          return deleted && outcome === 'deleted'
            ? HttpResponse.json({ status: 'error', error: { message: 'Batch not found' } }, { status: 404 })
            : HttpResponse.json({ batch: deleted ? emptyBatch : BATCH });
        }),
        http.get(`/api/v1/nursery/batches/${BATCH.id}/history`, () => {
          historyRequests++;
          return HttpResponse.json({ history: [], status: 'ok' });
        }),
        http.delete(`/api/v1/nursery/batches/${BATCH.id}`, () => {
          deleted = outcome !== 'failed';
          return HttpResponse.json({ status: deleted ? 'ok' : 'error' }, { status: deleted ? 200 : 500 });
        })
      );
      const { store, unmount } = renderWithProviders(<InventoryBatchView origin='Batches' species={[]} />, {
        route: `/inventory/batch/${BATCH.id}`,
        path: '/inventory/batch/:batchId',
      });
      await screen.findByRole('button', { name: strings.WITHDRAW });
      const history = store.dispatch(api.endpoints.getBatchHistory.initiate(BATCH.id));
      await history;
      await act(async () => {
        await store.dispatch(api.endpoints.deleteBatch.initiate(BATCH.id));
      });
      await waitFor(() => {
        expect(detailRequests).toBe(2);
        expect(historyRequests).toBe(2);
        expect(api.endpoints.getBatch.select(BATCH.id)(store.getState()).isLoading).toBe(false);
      });
      if (outcome === 'failed') {
        expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeInTheDocument();
      } else {
        await waitFor(() => expect(screen.queryByRole('button', { name: strings.WITHDRAW })).not.toBeInTheDocument());
        if (outcome === 'deleted') {
          expect(screen.queryByRole('tab', { name: strings.DETAILS })).not.toBeInTheDocument();
        } else {
          expect(api.endpoints.getBatch.select(BATCH.id)(store.getState()).data?.batch).toMatchObject(emptyBatch);
        }
      }
      history.unsubscribe();
      unmount();
      store.dispatch(api.util.resetApiState());
    }
  );

  it.each([
    {
      phase: 'germinating',
      quantity: 'GERMINATION_ESTABLISHMENT_QUANTITY',
      title: 'CHANGE_GERMINATION_ESTABLISHMENT_STATUS',
      fromLabel: 'GERMINATION_ESTABLISHMENT',
      fromQuantity: '5',
    },
    {
      phase: 'active growth',
      quantity: 'ACTIVE_GROWTH_QUANTITY',
      title: 'CHANGE_ACTIVE_GROWTH_STATUS',
      fromLabel: 'ACTIVE_GROWTH',
      fromQuantity: '10',
    },
    {
      phase: 'hardening off',
      quantity: 'HARDENING_OFF_QUANTITY',
      title: 'CHANGE_HARDENING_OFF_STATUS',
      fromLabel: 'HARDENING_OFF',
      fromQuantity: '3',
    },
  ] as const)(
    'editing the $phase quantity opens its status change',
    async ({ quantity, title, fromLabel, fromQuantity }) => {
      const { user } = renderDetails();

      await user.click(editButtonFor(strings[quantity]));

      const dialog = await screen.findByRole('dialog', { name: strings[title] });
      // The first read-only quantity in the dialog is the phase seedlings move out of.
      expect(dialog).toHaveTextContent(`${strings[fromLabel]}${fromQuantity}`);
    }
  );

  it('moves seedlings in the batch being viewed and closes the status change', async () => {
    const requests = captureRequests('post', `/api/v1/nursery/batches/${BATCH.id}/changeStatuses`);
    const { user } = renderDetails();

    await user.click(editButtonFor(strings.HARDENING_OFF_QUANTITY));
    const dialog = await screen.findByRole('dialog', { name: strings.CHANGE_HARDENING_OFF_STATUS });
    const moveInput = dialog.querySelector('#movedValue input') as HTMLInputElement;
    await user.type(moveInput, '2');
    await user.click(within(dialog).getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({ previousPhase: 'HardeningOff', newPhase: 'Ready' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: strings.CHANGE_HARDENING_OFF_STATUS })).not.toBeInTheDocument()
    );
  });
});
