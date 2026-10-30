import React, { useState } from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';
import QuantitiesMenu from 'src/scenes/InventoryRouter/view/QuantitiesMenu';
import strings from 'src/strings';
import { buildBatchSearchRow, captureRequests, renderWithProviders } from 'src/test-utils';
import { ModalValuesType } from 'src/types/Batch';

/**
 * The menu cell and the modal it opens, wired together the way `InventoryTable` and
 * `InventorySeedlingsTable` wire them, without the rest of the table.
 */
const MenuWithModal = ({ batch }: { batch: ReturnType<typeof buildBatchSearchRow> }) => {
  const [modalValues, setModalValues] = useState<ModalValuesType>({
    type: 'germinating',
    openChangeQuantityModal: false,
  });

  return (
    <>
      <QuantitiesMenu setModalValues={setModalValues} batch={batch} />
      {modalValues.openChangeQuantityModal && modalValues.batch && (
        <ChangeQuantityModal
          modalValues={modalValues}
          onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
          row={modalValues.batch}
        />
      )}
    </>
  );
};

/**
 * The menu button carries an icon and no label. Its tooltip title lands on the wrapping span rather
 * than the button, so the button is found inside the element that span names.
 */
const menuButton = () => within(screen.getByLabelText(strings.MORE_OPTIONS)).getByRole('button');

const renderMenu = (batch = buildBatchSearchRow()) => {
  const result = renderWithProviders(<MenuWithModal batch={batch} />);
  const openMenu = () => result.user.click(menuButton());
  return { ...result, openMenu };
};

describe('QuantitiesMenu', () => {
  it('disables the status change for phases that have no seedlings', async () => {
    const { openMenu } = renderMenu(
      buildBatchSearchRow({}, { germinatingQuantity: 0, activeGrowthQuantity: 10, hardeningOffQuantity: 0 })
    );

    await openMenu();

    expect(
      await screen.findByRole('menuitem', { name: strings.CHANGE_GERMINATION_ESTABLISHMENT_STATUS })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menuitem', { name: strings.CHANGE_ACTIVE_GROWTH_STATUS })).not.toHaveAttribute(
      'aria-disabled'
    );
    expect(screen.getByRole('menuitem', { name: strings.CHANGE_HARDENING_OFF_STATUS })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it.each([
    {
      phase: 'germinating',
      item: 'CHANGE_GERMINATION_ESTABLISHMENT_STATUS',
      fromLabel: 'GERMINATION_ESTABLISHMENT',
      fromQuantity: '5',
    },
    { phase: 'active growth', item: 'CHANGE_ACTIVE_GROWTH_STATUS', fromLabel: 'ACTIVE_GROWTH', fromQuantity: '10' },
    { phase: 'hardening off', item: 'CHANGE_HARDENING_OFF_STATUS', fromLabel: 'HARDENING_OFF', fromQuantity: '8' },
  ] as const)('opens the $phase status change for the batch', async ({ item, fromLabel, fromQuantity }) => {
    const { user, openMenu } = renderMenu(
      buildBatchSearchRow({}, { germinatingQuantity: 5, activeGrowthQuantity: 10, hardeningOffQuantity: 8 })
    );

    await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: strings[item] }));

    const dialog = await screen.findByRole('dialog', { name: strings[item] });
    // The first read-only quantity in the dialog is the phase seedlings move out of.
    expect(dialog).toHaveTextContent(`${strings[fromLabel]}${fromQuantity}`);
  });

  it('changes the status of the batch in its row', async () => {
    const requests = captureRequests('post', '/api/v1/nursery/batches/314/changeStatuses');
    const { user, openMenu } = renderMenu(buildBatchSearchRow({ id: '314' }, { activeGrowthQuantity: 10 }));

    await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: strings.CHANGE_ACTIVE_GROWTH_STATUS }));
    const dialog = await screen.findByRole('dialog', { name: strings.CHANGE_ACTIVE_GROWTH_STATUS });
    await user.type(dialog.querySelector('#movedValue input') as HTMLInputElement, '2');
    await user.click(within(dialog).getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
  });
});
