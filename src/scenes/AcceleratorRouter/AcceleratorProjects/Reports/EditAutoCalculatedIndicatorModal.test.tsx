import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import {
  ProjectAutoCalculatedIndicatorPayload,
  ProjectAutoCalculatedIndicatorSettingsPayload,
} from 'src/queries/generated/indicators';
import strings from 'src/strings';
import { captureRequests, mockGet, renderWithProviders } from 'src/test-utils';

import EditAutoCalculatedIndicatorModal from './EditAutoCalculatedIndicatorModal';

const PROJECT_ID = 7;
const updateUrl = `/api/v1/indicators/projects/${PROJECT_ID}/autoCalculated/Trees%20Planted`;

const indicator: ProjectAutoCalculatedIndicatorPayload = {
  active: true,
  category: 'Project Objectives',
  classId: 'Lifetime Cumulative',
  description: 'Total trees planted.',
  frequency: 'Quarterly',
  indicator: 'Trees Planted',
  isPublishable: false,
  level: 'Output',
  name: 'Trees Planted',
  precision: 0,
  refId: '1.3',
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

const renderModal = (autoCalculatedIndicator = indicator, locale = 'en') => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/users/me');
  mockGet('/api/v1/users/me/preferences');
  mockGet(`/api/v1/projects/${PROJECT_ID}`, { project: { id: PROJECT_ID, name: 'Brazil Biodiversity' } });
  return renderWithProviders(
    <EditAutoCalculatedIndicatorModal autoCalculatedIndicator={autoCalculatedIndicator} onClose={() => undefined} />,
    {
      route: `/accelerator/projects/${PROJECT_ID}/reports`,
      path: '/accelerator/projects/:projectId/*',
      localization: { activeLocale: locale, selectedLocale: locale },
    }
  );
};

it('saves the other settings when the Ref ID is blank', async () => {
  const requests = captureRequests('put', updateUrl);
  const { user } = renderModal({ ...indicator, refId: undefined });

  await user.type(notesInput(), 'Checked with the field team');
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  await waitFor(() => expect(requests).toHaveLength(1));
  const { indicator: saved } = (await requests[0].json()) as {
    indicator: ProjectAutoCalculatedIndicatorSettingsPayload;
  };
  expect(saved.notes).toBe('Checked with the field team');
  expect(saved.refId).toBeUndefined();
});

it('sends a cleared Ref ID as absent rather than empty', async () => {
  const requests = captureRequests('put', updateUrl);
  const { user } = renderModal();

  await user.clear(document.querySelector('#refId input') as HTMLInputElement);
  await user.click(screen.getByRole('button', { name: strings.SAVE }));

  await waitFor(() => expect(requests).toHaveLength(1));
  const { indicator: saved } = (await requests[0].json()) as {
    indicator: ProjectAutoCalculatedIndicatorSettingsPayload;
  };
  expect(saved.refId).toBeUndefined();
});

// In English these labels match the API's enum values, so only a translated locale shows the
// difference between a localized label and the raw payload value.
it('shows the read-only enum fields as localized labels, not raw API values', () => {
  renderModal(indicator, 'es');

  const displayed = (text: string) => screen.getByText(text, { selector: '.textfield-value--display' });
  expect(displayed(strings.PROJECT_OBJECTIVES)).toBeVisible();
  expect(displayed(strings.INDICATOR_TYPE_OUTPUT)).toBeVisible();
  expect(displayed(strings.QUARTERLY)).toBeVisible();
  expect(displayed(strings.LIFETIME_CUMULATIVE)).toBeVisible();
});
