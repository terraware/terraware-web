import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { ExistingCommonIndicatorPayload } from 'src/queries/generated/indicators';
import strings from 'src/strings';
import { captureRequests, mockGet, renderWithProviders } from 'src/test-utils';

import EditCommonIndicatorModal from './EditCommonIndicatorModal';

const PROJECT_ID = 7;

// A row the server seeded with the project's first reporting configuration: no Ref ID yet.
const seededIndicator: ExistingCommonIndicatorPayload = {
  active: true,
  category: 'Climate',
  classId: 'Lifetime Cumulative',
  id: 1,
  isPublishable: false,
  level: 'Outcome',
  name: 'Seeds Collected',
  precision: 0,
};

/** Textfield gives a textarea no id, so its label points at nothing and getByLabelText can't reach it. */
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

const renderModal = (commonIndicator = seededIndicator) => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/users/me');
  mockGet('/api/v1/users/me/preferences');
  mockGet(`/api/v1/projects/${PROJECT_ID}`, { project: { id: PROJECT_ID, name: 'Brazil Biodiversity' } });
  return renderWithProviders(<EditCommonIndicatorModal commonIndicator={commonIndicator} onClose={() => undefined} />, {
    route: `/accelerator/projects/${PROJECT_ID}/reports`,
    path: '/accelerator/projects/:projectId/*',
  });
};

it('saves an indicator that has no Ref ID yet', async () => {
  const requests = captureRequests('put', `/api/v1/indicators/projects/${PROJECT_ID}/common/1`);
  const { user } = renderModal();

  await user.type(notesInput(), 'Checked with the field team');
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  await waitFor(() => expect(requests).toHaveLength(1));
  const { indicator } = (await requests[0].json()) as { indicator: ExistingCommonIndicatorPayload };
  expect(indicator.notes).toBe('Checked with the field team');
  expect(indicator.refId).toBeUndefined();
});

it('sends a cleared Ref ID as absent rather than empty', async () => {
  const requests = captureRequests('put', `/api/v1/indicators/projects/${PROJECT_ID}/common/1`);
  const { user } = renderModal({ ...seededIndicator, refId: '1.1' });

  await user.clear(document.querySelector('#refId input') as HTMLInputElement);
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  await waitFor(() => expect(requests).toHaveLength(1));
  const { indicator } = (await requests[0].json()) as { indicator: ExistingCommonIndicatorPayload };
  expect(indicator.refId).toBeUndefined();
});

it('still requires a name', async () => {
  const requests = captureRequests('put', `/api/v1/indicators/projects/${PROJECT_ID}/common/1`);
  const { user } = renderModal({ ...seededIndicator, name: '' });

  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  expect(screen.getByText(strings.REQUIRED_FIELD)).toBeVisible();
  expect(requests).toHaveLength(0);
});

const seededWithValues: ExistingCommonIndicatorPayload = {
  ...seededIndicator,
  description: 'Community development projects funded.',
  frequency: 'Annual',
  refId: '1.31',
  tfOwner: 'Someone',
  unit: 'projects',
};

it('saves a project-level-only edit without confirming', async () => {
  const requests = captureRequests('put', `/api/v1/indicators/projects/${PROJECT_ID}/common/1`);
  const { user } = renderModal(seededWithValues);

  await user.type(notesInput(), 'Only our project changes');
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  await waitFor(() => expect(requests).toHaveLength(1));
  expect(screen.queryByText(strings.THIS_CHANGE_APPLIES_TO_ALL_PROJECTS)).toBeNull();
});

it('confirms before saving a shared-field edit, naming each changed field', async () => {
  const requests = captureRequests('put', `/api/v1/indicators/projects/${PROJECT_ID}/common/1`);
  const { user } = renderModal(seededWithValues);

  await user.clear(document.querySelector('#unit input') as HTMLInputElement);
  await user.type(document.querySelector('#unit input') as HTMLInputElement, 'people');
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  const confirmDialog = screen.getByText(strings.THIS_CHANGE_APPLIES_TO_ALL_PROJECTS).closest('.dialog-box');
  expect(confirmDialog).toBeVisible();
  expect(confirmDialog).toHaveClass('dialog-box--large');
  // A dialog is capped at the viewport height, so the body has to scroll or the buttons
  // can end up out of reach once several fields are listed.
  expect(confirmDialog?.querySelector('.dialog-box--body')).toHaveClass('scrolled');
  expect(screen.getByRole('listitem')).toHaveTextContent(strings.UNIT);
  expect(requests).toHaveLength(0);

  await user.click(screen.getByRole('button', { name: strings.SAVE_FOR_ALL_PROJECTS }));
  await waitFor(() => expect(requests).toHaveLength(1));
});

it('keeps the confirmation usable when every shared field changed', async () => {
  const requests = captureRequests('put', `/api/v1/indicators/projects/${PROJECT_ID}/common/1`);
  const { user } = renderModal(seededWithValues);

  await user.clear(document.querySelector('#name input') as HTMLInputElement);
  await user.type(document.querySelector('#name input') as HTMLInputElement, 'Renamed');
  await user.clear(document.querySelector('#unit input') as HTMLInputElement);
  await user.type(document.querySelector('#unit input') as HTMLInputElement, 'people');
  await user.clear(document.querySelector('#tfOwner input') as HTMLInputElement);
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    strings.INDICATOR_NAME,
    strings.UNIT,
    strings.TF_OWNER_REVIEWER,
  ]);

  const confirm = screen.getByRole('button', { name: strings.SAVE_FOR_ALL_PROJECTS });
  expect(confirm).toBeVisible();
  await user.click(confirm);
  await waitFor(() => expect(requests).toHaveLength(1));
});
