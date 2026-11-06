import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import strings from 'src/strings';
import { buildAccession, buildUser, captureRequests, mockError, mockGet, renderWithProviders } from 'src/test-utils';
import { Accession, ViabilityTest } from 'src/types/Accession';

import NewViabilityTestModal from './NewViabilityTestModal';

const URL = '/api/v2/seedbank/accessions/42';
const TESTS_URL = `${URL}/viabilityTests`;
const renderModal = (viabilityTest?: ViabilityTest, accession: Partial<Accession> = {}) => {
  mockGet(URL, { accession: buildAccession({ estimatedCount: 100, ...accession }) });
  mockGet('/api/v1/organizations/1/users', { users: [] });
  const onClose = rs.fn();
  return {
    ...renderWithProviders(
      <NewViabilityTestModal open onClose={onClose} user={buildUser()} viabilityTest={viabilityTest} />,
      { route: '/accessions/42', path: '/accessions/:accessionId' }
    ),
    onClose,
  };
};

// Web-components textfield labels target wrapper elements rather than inputs.
const input = (id: string) =>
  document.querySelector(`#${id} input, textarea#${id}, #${id} textarea`) as HTMLInputElement;
const enter = async (user: UserEvent, id: string, value: string) => {
  await user.clear(input(id));
  await user.type(input(id), value);
};
const enterDate = async (user: UserEvent, label: string, value: string) => {
  const field = screen.getByRole('textbox', { name: label });
  await user.click(field);
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(value);
};

describe('NewViabilityTestModal lab creation', () => {
  it('creates a lab test with the entered seed count, date, and notes', async () => {
    const requests = captureRequests('post', TESTS_URL);
    const { user, onClose } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await enter(user, 'seedsTested', '20');
    await enterDate(user, strings.START_DATE_REQUIRED, '2024-02-01');
    await user.type(document.querySelector('textarea') as HTMLTextAreaElement, 'Germination trial');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(requests).toHaveLength(1);
    expect(await requests[0].json()).toMatchObject({
      testType: 'Lab',
      seedsTested: '20',
      startDate: '2024-02-01',
      notes: 'Germination trial',
      withdrawnByUserId: 1,
    });
  });

  it.each([
    ['', 'REQUIRED_FIELD'],
    ['101', 'TOTAL_SEEDS_TESTED_ERROR'],
  ] as const)('rejects seed count %s without creating a test', async (value, error) => {
    const requests = captureRequests('post', TESTS_URL);
    const { user } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await user.clear(input('seedsTested'));
    if (value) {
      await user.type(input('seedsTested'), value);
    }
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getByText(strings[error])).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it.each([
    ['2023-12-31', 'VIABILITY_TEST_START_DATE_ERROR'],
    ['2099-01-01', 'NO_FUTURE_DATES'],
  ] as const)('rejects start date %s without creating a test', async (date, error) => {
    const requests = captureRequests('post', TESTS_URL);
    const { user } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await enter(user, 'seedsTested', '20');
    await enterDate(user, strings.START_DATE_REQUIRED, date);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getByText(strings[error])).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it('keeps the entered test open when creation fails', async () => {
    mockError('post', TESTS_URL);
    const { user, onClose, store } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await enter(user, 'seedsTested', '20');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(input('seedsTested')).toHaveValue('20');
  });

  it('cancels without creating a test', async () => {
    const requests = captureRequests('post', TESTS_URL);
    const { user, onClose } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await enter(user, 'seedsTested', '20');
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(0);
  });
});
