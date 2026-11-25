import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import SelectPurposeForm from 'src/components/BatchWithdrawFlow/flow/SelectPurposeForm';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import {
  buildBatchSearchRow,
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  mockGet,
  renderWithProviders,
  selectDropdownOption,
} from 'src/test-utils';
import { NurseryWithdrawalRequest, NurseryWithdrawalRequestPurposes } from 'src/types/Batch';

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {
        return undefined;
      }
      unobserve() {
        return undefined;
      }
      disconnect() {
        return undefined;
      }
    };
  }
});

const ONE_STRATUM_ONE_SUBSTRATUM = buildPlantingSite({
  id: 1,
  name: 'Single Site',
  strata: [buildStratum({ id: 10, name: 'North', substrata: [buildSubstratum({ id: 101, name: 'North-1' })] })],
});

const ONE_STRATUM_MANY_SUBSTRATA = buildPlantingSite({
  id: 2,
  name: 'Wide Site',
  strata: [
    buildStratum({
      id: 20,
      name: 'East',
      substrata: [buildSubstratum({ id: 201, name: 'East-1' }), buildSubstratum({ id: 202, name: 'East-2' })],
    }),
  ],
});

const MANY_STRATA = buildPlantingSite({
  id: 3,
  name: 'Multi Site',
  strata: [
    buildStratum({ id: 30, name: 'South', substrata: [buildSubstratum({ id: 301, name: 'South-1' })] }),
    buildStratum({
      id: 31,
      name: 'West',
      substrata: [buildSubstratum({ id: 311, name: 'West-1' }), buildSubstratum({ id: 312, name: 'West-2' })],
    }),
  ],
});

const renderForm = (sites: PlantingSitePayload[]) => {
  mockGet('/api/v1/tracking/sites', { sites });
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/projects', { projects: [] });

  const onNext = rstest.fn<(withdrawal: NurseryWithdrawalRequest) => void>();
  const result = renderWithProviders(
    <SelectPurposeForm
      batches={[buildBatchSearchRow()]}
      nurseryWithdrawal={{
        batchWithdrawals: [],
        facilityId: -1,
        purpose: NurseryWithdrawalRequestPurposes.OUTPLANT,
        withdrawnDate: '2026-01-01',
      }}
      onNext={onNext}
      onCancel={() => undefined}
      saveText={strings.NEXT}
      setFilterProjectId={() => undefined}
    />
  );
  return { ...result, onNext };
};

const stratumInput = () => screen.getByRole('combobox', { name: strings.STRATUM_REQUIRED });
const substratumInput = () => screen.getByRole('combobox', { name: strings.SUBSTRATUM_REQUIRED });

const choosePlantingPurpose = async (user: UserEvent) => {
  const planting = screen.getByRole('radio', { name: (name) => name.startsWith(strings.PLANTING) });
  await waitFor(() => expect(planting).toBeEnabled());
  await user.click(planting);
};

const choosePlantingSite = async (user: UserEvent, name: string) => {
  await selectDropdownOption(user, 'plantingSiteId', name);
};

const chooseStratum = async (user: UserEvent, name: string) => {
  await user.click(stratumInput());
  await user.click(await screen.findByRole('option', { name }));
};

describe('SelectPurposeForm stratum and substratum auto-selection', () => {
  it('selects the only stratum and its only substratum, and submits that substratum', async () => {
    const { user, onNext } = renderForm([ONE_STRATUM_ONE_SUBSTRATUM]);
    await choosePlantingPurpose(user);

    await choosePlantingSite(user, 'Single Site');

    expect(stratumInput()).toHaveValue('North');
    expect(substratumInput()).toHaveValue('North-1');

    const quantity = document.querySelector('#withdrawnQuantity input') as HTMLInputElement;
    await user.clear(quantity);
    await user.type(quantity, '5');
    await user.click(screen.getByRole('button', { name: strings.NEXT }));

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
    expect(onNext.mock.calls[0][0]).toMatchObject({ plantingSiteId: '1', substratumId: 101 });
  });

  it('selects the only stratum but leaves the substratum for the user when it has several', async () => {
    const { user } = renderForm([ONE_STRATUM_MANY_SUBSTRATA]);
    await choosePlantingPurpose(user);

    await choosePlantingSite(user, 'Wide Site');

    expect(stratumInput()).toHaveValue('East');
    expect(substratumInput()).toHaveValue('');
  });

  it('selects nothing when the site has several strata', async () => {
    const { user } = renderForm([MANY_STRATA]);
    await choosePlantingPurpose(user);

    await choosePlantingSite(user, 'Multi Site');

    expect(stratumInput()).toHaveValue('');
    expect(substratumInput()).toHaveValue('');
  });

  it('selects the substratum when the user picks a stratum that has only one', async () => {
    const { user } = renderForm([MANY_STRATA]);
    await choosePlantingPurpose(user);

    await choosePlantingSite(user, 'Multi Site');
    await chooseStratum(user, 'South');

    expect(substratumInput()).toHaveValue('South-1');
  });

  it('leaves the substratum for the user when the picked stratum has several', async () => {
    const { user } = renderForm([MANY_STRATA]);
    await choosePlantingPurpose(user);

    await choosePlantingSite(user, 'Multi Site');
    await chooseStratum(user, 'South');
    await chooseStratum(user, 'West');

    expect(stratumInput()).toHaveValue('West');
    expect(substratumInput()).toHaveValue('');
  });

  it('clears an auto-selection when the user switches to a site with several strata', async () => {
    const { user } = renderForm([ONE_STRATUM_ONE_SUBSTRATUM, MANY_STRATA]);
    await choosePlantingPurpose(user);

    await choosePlantingSite(user, 'Single Site');
    await choosePlantingSite(user, 'Multi Site');

    expect(stratumInput()).toHaveValue('');
    expect(substratumInput()).toHaveValue('');
  });
});
