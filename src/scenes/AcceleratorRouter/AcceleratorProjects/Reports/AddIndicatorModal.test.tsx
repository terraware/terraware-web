import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import AddIndicatorModal from './AddIndicatorModal';

const renderModal = (onClose = () => undefined) =>
  renderWithProviders(<AddIndicatorModal onClose={onClose} />, {
    route: '/accelerator/projects/7/reports',
    path: '/accelerator/projects/:projectId/*',
  });

beforeEach(() => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/projects/7', { project: { id: 7, name: 'Brazil Biodiversity', organizationId: 1 } });
});

it('requires a name and a Ref ID before sending a project-specific indicator', async () => {
  const { user } = renderModal();
  await user.click(screen.getByRole('button', { name: strings.ADD_INDICATOR }));
  expect(screen.getAllByText(strings.REQUIRED_FIELD)).toHaveLength(2);
});

it('drops the project-level fields when adding a common indicator', async () => {
  const { user } = renderModal();
  expect(document.querySelector('#refId input')).not.toBeNull();

  await user.click(screen.getByRole('radio', { name: new RegExp(strings.COMMON) }));

  expect(document.querySelector('#refId input')).toBeNull();
  expect(document.querySelector('#primaryDataSource input')).toBeNull();
  expect(document.querySelector('#notes textarea')).toBeNull();
  expect(screen.getByText(strings.COMMON_INDICATOR_PROJECT_DEFAULTS_MESSAGE)).toBeVisible();
});

it.each([
  ['project', '/api/v1/indicators/projects/7/project'],
  ['common', '/api/v1/indicators/common'],
])('sends only the %s indicator fields the endpoint accepts', async (kind, url) => {
  const requests: Request[] = [];
  server.use(
    http.post(url, ({ request }) => {
      requests.push(request.clone());
      return HttpResponse.json({ status: 'ok', indicatorId: 42 });
    })
  );

  const onClose = rs.fn();
  const { user } = renderModal(onClose);
  if (kind === 'common') {
    await user.click(screen.getByRole('radio', { name: new RegExp(strings.COMMON) }));
  }

  await user.type(document.querySelector('#name input') as HTMLInputElement, 'Forest cover');
  await user.type(document.querySelector('#unit input') as HTMLInputElement, 'hectares');
  if (kind === 'project') {
    await user.type(document.querySelector('#refId input') as HTMLInputElement, 'BIO-1');
  }
  await user.click(screen.getByRole('button', { name: strings.ADD_INDICATOR }));

  await waitFor(() => expect(requests).toHaveLength(1));
  const body = (await requests[0].json()) as { indicator: Record<string, unknown> };
  expect(body.indicator).toMatchObject({ name: 'Forest cover', unit: 'hectares' });
  if (kind === 'project') {
    expect(body.indicator.refId).toBe('BIO-1');
  } else {
    expect(body.indicator).not.toHaveProperty('refId');
    expect(body.indicator).not.toHaveProperty('active');
  }
  await waitFor(() => expect(onClose).toHaveBeenCalled());
});

it.each([
  ['project', '/api/v1/indicators/projects/7/project'],
  ['common', '/api/v1/indicators/common'],
])('creates a %s indicator with no unit', async (kind, url) => {
  const requests: Request[] = [];
  server.use(
    http.post(url, ({ request }) => {
      requests.push(request.clone());
      return HttpResponse.json({ status: 'ok', indicatorId: 42 });
    })
  );

  const { user } = renderModal();
  if (kind === 'common') {
    await user.click(screen.getByRole('radio', { name: new RegExp(strings.COMMON) }));
  }
  await user.type(document.querySelector('#name input') as HTMLInputElement, 'Community approval score');
  if (kind === 'project') {
    await user.type(document.querySelector('#refId input') as HTMLInputElement, 'COM-1');
  }
  await user.click(screen.getByRole('button', { name: strings.ADD_INDICATOR }));

  await waitFor(() => expect(requests).toHaveLength(1));
  const { indicator } = (await requests[0].json()) as { indicator: Record<string, unknown> };
  expect(indicator.name).toBe('Community approval score');
  expect(indicator.unit).toBeUndefined();
});

// jsdom does not emulate the browser's arrow-key navigation between radios, so assert the
// structure the browser needs for it instead: one labelled group whose inputs share a name.
it('puts both indicator types in one named radio group', () => {
  renderModal();

  const group = screen.getByRole('radiogroup', { name: new RegExp(strings.INDICATOR_TYPE) });
  const radios = within(group).getAllByRole('radio');

  expect(radios).toHaveLength(2);
  expect(radios.map((radio) => radio.getAttribute('name'))).toEqual(['indicatorKind', 'indicatorKind']);
});

it('shows the common fields once that type is selected', async () => {
  const { user } = renderModal();
  expect(document.querySelector('#refId input')).not.toBeNull();

  await user.click(screen.getByRole('radio', { name: new RegExp(strings.ADDED_TO_ALL_PROJECTS) }));

  expect(screen.getByRole('radio', { name: new RegExp(strings.ADDED_TO_ALL_PROJECTS) })).toBeChecked();
  expect(document.querySelector('#refId input')).toBeNull();
});

it('blocks cancelling and dismissing while the create request is in flight', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  server.use(
    http.post('/api/v1/indicators/projects/7/project', async () => {
      await pending;
      return HttpResponse.json({ status: 'ok' });
    })
  );

  const onClose = rs.fn();
  const { user } = renderModal(onClose);
  await user.type(document.querySelector('#name input') as HTMLInputElement, 'Forest cover');
  await user.type(document.querySelector('#refId input') as HTMLInputElement, 'BIO-1');
  await user.click(screen.getByRole('button', { name: strings.ADD_INDICATOR }));

  const cancel = screen.getByRole('button', { name: strings.CANCEL });
  await waitFor(() => expect(cancel).toBeDisabled());
  expect(screen.getByRole('button', { name: strings.ADD_INDICATOR })).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();

  release();
  await waitFor(() => expect(onClose).toHaveBeenCalled());
});
