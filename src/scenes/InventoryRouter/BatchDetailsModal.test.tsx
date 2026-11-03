import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import ToastSnackbar from 'src/components/ToastSnackbar';
import BatchDetailsModal from 'src/scenes/InventoryRouter/BatchDetailsModal';
import strings from 'src/strings';
import {
  buildBatch,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  selectDropdownOption,
} from 'src/test-utils';

const BATCH_ID = 42;
const PHOTOS_URL = `/api/v1/nursery/batches/${BATCH_ID}/photos`;
const PHOTO_URL = `/api/v1/nursery/batches/${BATCH_ID}/photos/:photoId`;
const BATCH_URL = `/api/v1/nursery/batches/${BATCH_ID}`;
const QUANTITIES_URL = `/api/v1/nursery/batches/${BATCH_ID}/quantities`;

const fileInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('BatchDetailsModal photos', () => {
  it('uploads a newly selected photo to the batch when the details are saved', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    const requests = captureRequests('post', PHOTOS_URL, { id: 7 });

    const { container, user } = renderWithProviders(
      <BatchDetailsModal batch={buildBatch({ id: BATCH_ID })} onClose={() => undefined} />
    );

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput(container), file);

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toContain(`/nursery/batches/${BATCH_ID}/photos`);
  });

  it('deletes an existing photo when its remove control is used and the details are saved', async () => {
    const PHOTO_ID = 99;
    mockGet(PHOTOS_URL, { photos: [{ id: PHOTO_ID }] });
    const requests = captureRequests('delete', PHOTO_URL);

    const { user } = renderWithProviders(
      <BatchDetailsModal batch={buildBatch({ id: BATCH_ID })} onClose={() => undefined} />
    );

    const photo = await screen.findByAltText('0');
    await user.click(within(photo.parentElement as HTMLElement).getByRole('button'));

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('DELETE');
    expect(requests[0].url).toContain(`/nursery/batches/${BATCH_ID}/photos/${PHOTO_ID}`);
  });
});

const BATCH = buildBatch({ id: BATCH_ID, version: 5, germinatingQuantity: 5, readyQuantity: 7 });

const renderEditModal = ({ onClose = () => undefined, locale }: { onClose?: () => void; locale?: string } = {}) =>
  renderWithProviders(
    <>
      <BatchDetailsModal batch={BATCH} onClose={onClose} />
      <ToastSnackbar />
    </>,
    locale ? { localization: { activeLocale: locale, selectedLocale: locale } } : undefined
  );

const captureSave = () => ({
  updates: captureRequests('put', BATCH_URL, { batch: { ...BATCH, version: 6 } }),
  quantityUpdates: captureRequests('put', QUANTITIES_URL, { batch: { ...BATCH, version: 7 } }),
});

/** The messages attached to a field. Error text is a `label` pointing at the field it describes. */
const messagesFor = (id: string): string[] =>
  Array.from(document.querySelectorAll(`label[for="${id}"]`)).map((label) => label.textContent ?? '');

const textInput = (id: string): HTMLInputElement | null => document.querySelector<HTMLInputElement>(`#${id} input`);

const enterQuantity = async (user: UserEvent, id: string, quantity: string) => {
  const input = textInput(id);
  if (!input) {
    throw new Error(`No quantity input ${id}`);
  }
  await user.clear(input);
  await user.type(input, quantity);
};

const quantityNotesInput = () => screen.getByPlaceholderText(strings.REMAINING_QUANTITY_NOTES_PLACEHOLDER);

/**
 * The Notes textarea. Textfield gives a textarea no id, so its label points at nothing and
 * `getByLabelText` cannot reach it.
 */
const notesInput = (): HTMLTextAreaElement => {
  const textarea = screen
    .getByText(strings.NOTES, { selector: 'label' })
    .closest('.textfield')
    ?.querySelector<HTMLTextAreaElement>('textarea');
  if (!textarea) {
    throw new Error('No Notes textarea');
  }
  return textarea;
};

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

describe('BatchDetailsModal editing', () => {
  it('requires quantity notes when a quantity changes, and saves nothing until they are given', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    const { updates, quantityUpdates } = captureSave();
    const { user } = renderEditModal();

    await enterQuantity(user, 'readyQuantity', '9');
    await save(user);

    await waitFor(() => expect(messagesFor('quantityNotes')).toContain(strings.REQUIRED_FIELD));
    expect(updates).toHaveLength(0);
    expect(quantityUpdates).toHaveLength(0);

    await user.type(quantityNotesInput(), 'Recounted');
    await save(user);

    await waitFor(() => expect(quantityUpdates).toHaveLength(1));
  });

  it('does not ask for quantity notes when no quantity changed', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    const { updates } = captureSave();
    const { user } = renderEditModal();

    await user.type(notesInput(), 'Moved to shade house');
    await save(user);

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toMatchObject({ notes: 'Moved to shade house' });
    expect(messagesFor('quantityNotes')).not.toContain(strings.REQUIRED_FIELD);
  });

  it('updates the batch and then its quantities, with the notes and the version the update returned', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    const { updates, quantityUpdates } = captureSave();
    const { user } = renderEditModal();

    await enterQuantity(user, 'germinatingQuantity', '2');
    await enterQuantity(user, 'readyQuantity', '9');
    await user.type(quantityNotesInput(), 'Recounted');
    await save(user);

    await waitFor(() => expect(quantityUpdates).toHaveLength(1));
    expect(await updates[0].json()).toMatchObject({ version: 5 });
    expect(await quantityUpdates[0].json()).toEqual({
      germinatingQuantity: 2,
      activeGrowthQuantity: BATCH.activeGrowthQuantity,
      hardeningOffQuantity: BATCH.hardeningOffQuantity,
      readyQuantity: 9,
      notes: 'Recounted',
      version: 6,
    });
  });

  it.each(
    ['en', 'fr', 'es'].flatMap((locale) => [
      { locale, field: 'substrate', notesField: 'substrateNotes' },
      { locale, field: 'treatment', notesField: 'treatmentNotes' },
    ])
  )('asks for a description when $field is Other in $locale, and saves it', async ({ locale, field, notesField }) => {
    mockGet(PHOTOS_URL, { photos: [] });
    const { updates } = captureSave();
    const { user } = renderEditModal({ locale });

    expect(textInput(notesField)).toBeNull();

    await selectDropdownOption(user, field, strings.OTHER);
    const description = textInput(notesField);
    expect(description).not.toBeNull();

    await user.type(description as HTMLInputElement, 'Coconut coir');
    await save(user);

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toMatchObject({ [field]: 'Other', [notesField]: 'Coconut coir' });
  });

  it('closes once the batch has been saved', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    captureSave();
    let closed = false;
    const { user } = renderEditModal({ onClose: () => (closed = true) });

    await enterQuantity(user, 'readyQuantity', '9');
    await user.type(quantityNotesInput(), 'Recounted');
    await save(user);

    await waitFor(() => expect(closed).toBe(true));
  });

  it('keeps the modal open and reports the failure when the batch cannot be saved', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    mockError('put', BATCH_URL);
    const quantityUpdates = captureRequests('put', QUANTITIES_URL);
    let closed = false;
    const { user } = renderEditModal({ onClose: () => (closed = true) });

    await enterQuantity(user, 'readyQuantity', '9');
    await user.type(quantityNotesInput(), 'Recounted');
    await save(user);

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    // Closing here would tell the user the new quantities were recorded when they were not.
    expect(closed).toBe(false);
    expect(quantityUpdates).toHaveLength(0);
    expect(screen.getByRole('dialog', { name: strings.EDIT_BATCH_DETAILS })).toBeInTheDocument();
  });
});
