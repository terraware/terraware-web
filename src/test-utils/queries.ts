import { screen } from '@testing-library/react';

/**
 * The open dialog with this title, to scope queries to it. `DialogBox` renders no ARIA dialog role,
 * so its class is the only handle a test has — which matters when the same label appears both inside
 * the dialog and in the page behind it.
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
