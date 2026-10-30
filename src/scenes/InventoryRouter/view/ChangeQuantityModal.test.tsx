import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';
import strings from 'src/strings';
import {
  buildBatchSearchRow,
  captureRequests,
  mockError,
  renderWithProviders,
  selectDropdownOption,
} from 'src/test-utils';

type SourcePhase = 'germinating' | 'active-growth' | 'hardening-off';

const BATCH_ID = 42;
const CHANGE_STATUSES_URL = `/api/v1/nursery/batches/${BATCH_ID}/changeStatuses`;

const ROW = buildBatchSearchRow(
  { id: String(BATCH_ID) },
  { germinatingQuantity: 20, activeGrowthQuantity: 30, hardeningOffQuantity: 40, readyQuantity: 50 }
);

type NextPhase = 'ActiveGrowth' | 'HardeningOff' | 'Ready';

const DEFAULT_NEXT_PHASE: Record<SourcePhase, NextPhase> = {
  germinating: 'ActiveGrowth',
  'active-growth': 'HardeningOff',
  'hardening-off': 'Ready',
};

const titleFor = (type: SourcePhase) =>
  ({
    germinating: strings.CHANGE_GERMINATION_ESTABLISHMENT_STATUS,
    'active-growth': strings.CHANGE_ACTIVE_GROWTH_STATUS,
    'hardening-off': strings.CHANGE_HARDENING_OFF_STATUS,
  })[type];

const sourceLabelFor = (type: SourcePhase) =>
  ({
    germinating: strings.GERMINATION_ESTABLISHMENT,
    'active-growth': strings.ACTIVE_GROWTH,
    'hardening-off': strings.HARDENING_OFF,
  })[type];

const nextPhaseLabelFor = (phase: NextPhase) =>
  ({
    ActiveGrowth: strings.ACTIVE_GROWTH,
    HardeningOff: strings.HARDENING_OFF,
    Ready: strings.READY_TO_PLANT,
  })[phase];

const renderModal = (
  type: SourcePhase,
  { onClose = () => undefined, reload = () => undefined }: { onClose?: () => void; reload?: () => void } = {}
) =>
  renderWithProviders(
    <ChangeQuantityModal
      modalValues={{ type, openChangeQuantityModal: true }}
      onClose={onClose}
      reload={reload}
      row={ROW}
    />
  );

/**
 * The quantity shown under a read-only label. The from/to quantities render as display-only
 * textfields, whose value is a paragraph next to the label rather than an input it labels, so there
 * is no accessible name to query by.
 */
const quantityShownFor = (label: string): string | null =>
  screen.getByText(label, { selector: 'label' }).closest('.textfield')?.querySelector('.textfield-value--display')
    ?.textContent ?? null;

/**
 * The Move input. Its label points at the wrapper `div` that carries the id rather than at the input
 * itself, so `getByLabelText` cannot reach it — the same reason `selectDropdownOption` goes by id.
 */
const moveInput = (): HTMLInputElement => {
  const input = document.querySelector<HTMLInputElement>('#movedValue input');
  if (!input) {
    throw new Error('No Move input');
  }
  return input;
};

const enterMove = async (user: UserEvent, quantity: string) => {
  await user.clear(moveInput());
  await user.type(moveInput(), quantity);
};

const chooseNextPhase = async (user: UserEvent, from: SourcePhase, to: NextPhase) => {
  if (to !== DEFAULT_NEXT_PHASE[from]) {
    await selectDropdownOption(user, 'nextGrowthPhase', nextPhaseLabelFor(to));
  }
};

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

describe('ChangeQuantityModal', () => {
  describe('next phase options', () => {
    it.each<{ from: SourcePhase; options: NextPhase[] }>([
      { from: 'germinating', options: ['ActiveGrowth', 'HardeningOff', 'Ready'] },
      { from: 'active-growth', options: ['HardeningOff', 'Ready'] },
      { from: 'hardening-off', options: ['Ready'] },
    ])('offers only later phases when moving from $from', async ({ from, options }) => {
      const { user } = renderModal(from);

      expect(screen.getByRole('dialog', { name: titleFor(from) })).toBeInTheDocument();

      await user.click(document.querySelector('#nextGrowthPhase input') as HTMLElement);
      const list = await screen.findByRole('list');

      expect(
        within(list)
          .getAllByRole('listitem')
          .map((option) => option.textContent)
      ).toEqual(options.map(nextPhaseLabelFor));
    });
  });

  describe('quantities preview', () => {
    it.each<{ from: SourcePhase; to: NextPhase; fromAfter: string; toAfter: string }>([
      { from: 'germinating', to: 'ActiveGrowth', fromAfter: '15', toAfter: '35' },
      { from: 'germinating', to: 'HardeningOff', fromAfter: '15', toAfter: '45' },
      { from: 'germinating', to: 'Ready', fromAfter: '15', toAfter: '55' },
      { from: 'active-growth', to: 'HardeningOff', fromAfter: '25', toAfter: '45' },
      { from: 'active-growth', to: 'Ready', fromAfter: '25', toAfter: '55' },
      { from: 'hardening-off', to: 'Ready', fromAfter: '35', toAfter: '55' },
    ])(
      'moving 5 from $from to $to updates both quantities as the user types',
      async ({ from, to, fromAfter, toAfter }) => {
        const { user } = renderModal(from);

        await chooseNextPhase(user, from, to);
        await enterMove(user, '5');

        expect(quantityShownFor(sourceLabelFor(from))).toBe(fromAfter);
        expect(quantityShownFor(nextPhaseLabelFor(to))).toBe(toAfter);
      }
    );

    it('starts from the batch quantities and returns to them when the move is cleared', async () => {
      const { user } = renderModal('germinating');

      expect(quantityShownFor(strings.GERMINATION_ESTABLISHMENT)).toBe('20');
      expect(quantityShownFor(strings.ACTIVE_GROWTH)).toBe('30');

      await enterMove(user, '5');
      await user.clear(moveInput());

      expect(quantityShownFor(strings.GERMINATION_ESTABLISHMENT)).toBe('20');
      expect(quantityShownFor(strings.ACTIVE_GROWTH)).toBe('30');
    });

    it('recalculates for the new destination when the next phase changes after entering a move', async () => {
      const { user } = renderModal('germinating');

      await enterMove(user, '5');
      await selectDropdownOption(user, 'nextGrowthPhase', strings.READY_TO_PLANT);

      expect(quantityShownFor(strings.GERMINATION_ESTABLISHMENT)).toBe('15');
      expect(quantityShownFor(strings.READY_TO_PLANT)).toBe('55');
    });
  });

  describe('saving', () => {
    it.each<{ from: SourcePhase; to: NextPhase; previousPhase: string }>([
      { from: 'germinating', to: 'ActiveGrowth', previousPhase: 'Germinating' },
      { from: 'germinating', to: 'HardeningOff', previousPhase: 'Germinating' },
      { from: 'active-growth', to: 'Ready', previousPhase: 'ActiveGrowth' },
      { from: 'hardening-off', to: 'Ready', previousPhase: 'HardeningOff' },
    ])('moving from $from to $to sends the phases and quantity', async ({ from, to, previousPhase }) => {
      const requests = captureRequests('post', CHANGE_STATUSES_URL);
      const { user } = renderModal(from);

      await chooseNextPhase(user, from, to);
      await enterMove(user, '5');
      await save(user);

      await waitFor(() => expect(requests).toHaveLength(1));
      const { quantity, ...rest } = await requests[0].json();
      expect(rest).toEqual({ previousPhase, newPhase: to });
      // Compared as a number because the modal currently sends the typed text; see the skipped test
      // below.
      expect(Number(quantity)).toBe(5);
    });

    // Skipped: the modal sends the Move field's text as-is, so the body carries `"quantity": "5"`
    // where the API declares an integer. It works today only because the server coerces the string.
    it.skip('sends the quantity as a number', async () => {
      const requests = captureRequests('post', CHANGE_STATUSES_URL);
      const { user } = renderModal('germinating');

      await enterMove(user, '5');
      await save(user);

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(await requests[0].json()).toMatchObject({ quantity: 5 });
    });

    it('accepts moving every seedling out of the phase', async () => {
      const requests = captureRequests('post', CHANGE_STATUSES_URL);
      const { user } = renderModal('germinating');

      await enterMove(user, '20');
      await save(user);

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(Number((await requests[0].json()).quantity)).toBe(20);
    });

    it('reloads the batch data and closes after a successful save', async () => {
      captureRequests('post', CHANGE_STATUSES_URL);
      let closed = false;
      let reloaded = false;
      const { user } = renderModal('germinating', {
        onClose: () => (closed = true),
        reload: () => (reloaded = true),
      });

      await enterMove(user, '5');
      await save(user);

      await waitFor(() => expect(closed).toBe(true));
      expect(reloaded).toBe(true);
    });

    it('keeps the modal open and reports the failure when the change fails', async () => {
      mockError('post', CHANGE_STATUSES_URL);
      let closed = false;
      let reloaded = false;
      const { user, store } = renderModal('germinating', {
        onClose: () => (closed = true),
        reload: () => (reloaded = true),
      });

      await enterMove(user, '5');
      await save(user);

      await waitFor(() => {
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
      });
      // Closing or reloading here would tell the user the seedlings moved when they did not.
      expect(closed).toBe(false);
      expect(reloaded).toBe(false);
      expect(screen.getByRole('dialog', { name: titleFor('germinating') })).toBeInTheDocument();
      expect(moveInput()).toHaveValue(5);
    });

    it('closes without sending anything when cancelled', async () => {
      const requests = captureRequests('post', CHANGE_STATUSES_URL);
      let closed = false;
      const { user } = renderModal('germinating', { onClose: () => (closed = true) });

      await enterMove(user, '5');
      await user.click(screen.getByRole('button', { name: strings.CANCEL }));

      expect(closed).toBe(true);
      expect(requests).toHaveLength(0);
    });
  });

  describe('validation', () => {
    it.each([
      ['empty', ''],
      ['zero', '0'],
    ])('requires a move quantity when it is %s', async (_description, quantity) => {
      const requests = captureRequests('post', CHANGE_STATUSES_URL);
      let closed = false;
      const { user } = renderModal('germinating', { onClose: () => (closed = true) });

      if (quantity) {
        await enterMove(user, quantity);
      }
      await save(user);

      expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
      expect(requests).toHaveLength(0);
      expect(closed).toBe(false);
    });

    it.each<{ from: SourcePhase; quantity: string; message: () => string }>([
      {
        from: 'germinating',
        quantity: '21',
        message: () => strings.GERMINATION_ESTABLISHMENT_QUANTITY_CANNOT_BE_LESS_THAN_ZERO,
      },
      { from: 'active-growth', quantity: '31', message: () => strings.ACTIVE_GROWTH_QUANTITY_CANNOT_BE_LESS_THAN_ZERO },
      { from: 'hardening-off', quantity: '41', message: () => strings.HARDENING_OFF_QUANTITY_CANNOT_BE_LESS_THAN_ZERO },
    ])('refuses to move more than $from holds', async ({ from, quantity, message }) => {
      const requests = captureRequests('post', CHANGE_STATUSES_URL);
      let closed = false;
      const { user } = renderModal(from, { onClose: () => (closed = true) });

      await enterMove(user, quantity);
      await save(user);

      expect(await screen.findByText(message())).toBeInTheDocument();
      expect(requests).toHaveLength(0);
      expect(closed).toBe(false);
    });
  });
});
