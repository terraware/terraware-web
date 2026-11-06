import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import strings from 'src/strings';
import {
  buildAccession,
  buildUser,
  buildViabilityTest,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';
import { Accession, ViabilityTest } from 'src/types/Accession';

import NewViabilityTestModal from './NewViabilityTestModal';

const URL = '/api/v2/seedbank/accessions/42';
const TESTS_URL = `${URL}/viabilityTests`;
const renderModal = (viabilityTest?: ViabilityTest, accession: Partial<Accession> = {}) => {
  mockGet(URL, { accession: buildAccession({ estimatedCount: 100, ...accession }) });
  mockGet('/api/v1/organizations/1/users', { users: [] });
  const onClose = rs.fn();
  const Modal = () => {
    const [open, setOpen] = React.useState(true);
    return (
      <NewViabilityTestModal
        open={open}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        user={buildUser()}
        viabilityTest={viabilityTest}
      />
    );
  };
  return {
    ...renderWithProviders(<Modal />, { route: '/accessions/42', path: '/accessions/:accessionId' }),
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

describe('NewViabilityTestModal cut tests and completion', () => {
  const chooseCut = async (user: UserEvent) => {
    await user.click(document.querySelector('#test-method input') as HTMLInputElement);
    await user.click(await screen.findByText(strings.CUT_TEST));
  };
  const fillCut = async (user: UserEvent) => {
    await chooseCut(user);
    await enter(user, 'seedsFilled', '8');
    await enter(user, 'seedsCompromised', '1');
    await enter(user, 'seedsEmpty', '1');
  };

  it('creates a cut test and offers the computed result for explicit application', async () => {
    const requests = captureRequests('post', TESTS_URL);
    const updates = captureRequests('put', URL);
    const { user, onClose } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await fillCut(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(await screen.findByText('90%')).toBeVisible();
    expect(screen.getByRole('button', { name: strings.APPLY_RESULT })).toBeVisible();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(1);
    expect(await requests[0].json()).toMatchObject({
      testType: 'Cut',
      seedsTested: 10,
      seedsFilled: '8',
      seedsCompromised: '1',
      seedsEmpty: '1',
    });
    expect(updates).toHaveLength(0);
  });

  it('blocks a cut-test total above available inventory', async () => {
    const requests = captureRequests('post', TESTS_URL);
    const { user } = renderModal(undefined, { estimatedCount: 5 });
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await fillCut(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getByText(strings.TOTAL_SEEDS_TESTED_ERROR)).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it('does not offer result application when saving the cut test fails', async () => {
    mockError('post', TESTS_URL);
    const { user, onClose, store } = renderModal();
    await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST });
    await fillCut(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(screen.queryByRole('button', { name: strings.APPLY_RESULT })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('offers to apply a lab result only after saving the completed test', async () => {
    const requests = captureRequests('put', `${TESTS_URL}/1`);
    const { user } = renderModal(
      buildViabilityTest({
        testResults: [{ recordingDate: '2024-02-02', seedsGerminated: 10 }],
      })
    );
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    await user.click(screen.getByRole('checkbox', { name: strings.MARK_AS_COMPLETE }));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(await screen.findByText('40%')).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(await requests[0].json()).toHaveProperty('endDate');
  });

  it.skip('allows an existing cut test to retain its already-withdrawn seed total', async () => {
    const requests = captureRequests('put', `${TESTS_URL}/1`);
    const { user, onClose } = renderModal(
      buildViabilityTest({
        testType: 'Cut',
        seedsTested: 20,
        seedsFilled: 18,
        seedsCompromised: 1,
        seedsEmpty: 1,
      }),
      { estimatedCount: 5 }
    );
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(await requests[0].json()).toMatchObject({ seedsTested: 20 });
  });
});

describe('NewViabilityTestModal observations', () => {
  it('adds an observation to an existing test without changing its original count or start date', async () => {
    const requests = captureRequests('put', `${TESTS_URL}/1`);
    const { user, onClose } = renderModal(buildViabilityTest());
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    expect(input('seedsTested')).toBeDisabled();
    expect(screen.getByRole('textbox', { name: strings.START_DATE_REQUIRED })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: strings.ADD_OBSERVATION }));
    await enterDate(user, strings.CHECK_DATE_REQUIRED, '2024-02-02');
    await enter(user, 'seedsGerminated', '8');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(requests).toHaveLength(1);
    expect(await requests[0].json()).toMatchObject({
      seedsTested: 25,
      startDate: '2024-02-01',
      testResults: [{ recordingDate: '2024-02-02', seedsGerminated: '8' }],
    });
  });

  it('rejects an observation before the test starts', async () => {
    const requests = captureRequests('put', `${TESTS_URL}/1`);
    const { user } = renderModal(buildViabilityTest());
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    await user.click(screen.getByRole('button', { name: strings.ADD_OBSERVATION }));
    await enterDate(user, strings.CHECK_DATE_REQUIRED, '2024-01-31');
    await enter(user, 'seedsGerminated', '8');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getByText(strings.RECORDING_DATE_ERROR)).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it('rejects a germination total above the seeds tested', async () => {
    const requests = captureRequests('put', `${TESTS_URL}/1`);
    const { user } = renderModal(buildViabilityTest());
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    await user.click(screen.getByRole('button', { name: strings.ADD_OBSERVATION }));
    await enter(user, 'seedsGerminated', '26');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getByText(strings.TOTAL_SEEDS_GERMINATED_ERROR)).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it('removes an observation before saving', async () => {
    const requests = captureRequests('put', `${TESTS_URL}/1`);
    const { user, onClose } = renderModal(
      buildViabilityTest({
        testResults: [{ recordingDate: '2024-02-02', seedsGerminated: 8 }],
      })
    );
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    await user.click(screen.getByRole('button', { name: 'delete' }));
    expect(screen.queryByRole('textbox', { name: strings.CHECK_DATE_REQUIRED })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(await requests[0].json()).toMatchObject({ testResults: [] });
  });

  it('retains observations when updating fails', async () => {
    mockError('put', `${TESTS_URL}/1`);
    const { user, onClose, store } = renderModal(
      buildViabilityTest({
        testResults: [{ recordingDate: '2024-02-02', seedsGerminated: 8 }],
      })
    );
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    await enter(user, 'seedsGerminated', '9');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(input('seedsGerminated')).toHaveValue('9');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('protects completed observations from editing or removal', async () => {
    renderModal(
      buildViabilityTest({ endDate: '2024-02-03', testResults: [{ recordingDate: '2024-02-02', seedsGerminated: 8 }] })
    );
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY_TEST });
    expect(input('seedsGerminated')).toBeDisabled();
    expect(screen.getByRole('textbox', { name: strings.CHECK_DATE_REQUIRED })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: strings.ADD_OBSERVATION })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: strings.MARK_AS_COMPLETE })).toBeDisabled();
  });
});

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
