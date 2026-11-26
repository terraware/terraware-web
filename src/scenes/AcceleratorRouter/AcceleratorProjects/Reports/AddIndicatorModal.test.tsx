import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
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

it('requires a name, a unit and a Ref ID before sending a project-specific indicator', async () => {
  const { user } = renderModal();
  await user.click(screen.getByRole('button', { name: strings.ADD_INDICATOR }));
  expect(screen.getAllByText(strings.REQUIRED_FIELD)).toHaveLength(3);
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
