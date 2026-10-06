import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

/**
 * The open dialog with this title, to scope queries to it — which matters when the same label
 * appears both inside the dialog and in the page behind it.
 *
 * Matching on the class is a workaround: `DialogBox` sets no ARIA dialog role, so there is no
 * accessible handle to query by. Giving it `role='dialog'` would let this switch to
 * `getByRole('dialog')` without touching a single caller, and would make the dialog navigable for
 * screen reader users at the same time.
 *
 * ```ts
 * const dialog = dialogTitled(strings.DELETE_SPECIES);
 * await user.click(within(dialog).getByRole('button', { name: strings.DELETE }));
 * ```
 */
export const dialogTitled = (title: string): HTMLElement => {
  const box = screen.getByText(title).closest('.dialog-box');
  if (!box) {
    throw new Error(`No open dialog titled "${title}"`);
  }
  return box as HTMLElement;
};

export const selectDropdownOption = async (user: UserEvent, dropdownId: string, option: string): Promise<void> => {
  const input = document.querySelector(`#${dropdownId} input`);
  if (!input) {
    throw new Error(`No dropdown with id "${dropdownId}"`);
  }
  await user.click(input);
  await user.click(within(await screen.findByRole('list')).getByText(option));
};
