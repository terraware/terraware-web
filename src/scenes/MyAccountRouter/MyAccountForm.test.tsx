import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import MyAccountForm from 'src/scenes/MyAccountRouter/MyAccountForm';
import strings from 'src/strings';
import { buildUser, captureRequests, mockGet, mockPut, renderWithProviders } from 'src/test-utils';

const EMAIL_SETTINGS_URL = '/api/v1/users/me/emailNotifications';
const ME_URL = '/api/v1/users/me';

type CategorySetting = {
  category: 'SeedBank' | 'Nursery' | 'PlantingAndObservations' | 'Accelerator';
  optedIn: boolean;
};

const ALL_CATEGORIES: CategorySetting[] = [
  { category: 'SeedBank', optedIn: true },
  { category: 'Nursery', optedIn: false },
  { category: 'PlantingAndObservations', optedIn: true },
  { category: 'Accelerator', optedIn: true },
];

const mockEmailSettings = (categories: CategorySetting[], emailNotificationsEnabled = true) =>
  mockGet(EMAIL_SETTINGS_URL, { categories, emailNotificationsEnabled });

// Saving the form also writes preferences and acknowledges the time zone; neither is under test here.
const mockProfileSaveSideEffects = () => {
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockPut('/api/v1/users/me/preferences');
};

const renderForm = (edit: boolean) => {
  let returnedToView = false;
  const result = renderWithProviders(
    <MyAccountForm
      edit={edit}
      user={buildUser({ firstName: 'Ada' })}
      reloadUser={() => undefined}
      backToView={() => (returnedToView = true)}
    />
  );
  return { ...result, returnedToView: () => returnedToView };
};

// Each switch is named by its setting's title.
const settingSwitch = (name: string) => screen.getByRole('switch', { name });
const findMasterSwitch = () => screen.findByRole('switch', { name: strings.EMAIL_NOTIFICATIONS });

describe('MyAccountForm email notification settings', () => {
  it('shows a switch only for the categories the server returns, in a fixed order', async () => {
    mockEmailSettings([
      { category: 'PlantingAndObservations', optedIn: true },
      { category: 'SeedBank', optedIn: true },
      { category: 'Nursery', optedIn: false },
    ]);

    renderForm(false);

    const master = await findMasterSwitch();
    expect(screen.getAllByRole('switch')).toEqual([
      master,
      settingSwitch(strings.SEED_BANK),
      settingSwitch(strings.NURSERY),
      settingSwitch(strings.PLANTING_AND_OBSERVATIONS),
    ]);
    expect(screen.queryByRole('switch', { name: strings.ACCELERATOR })).not.toBeInTheDocument();
  });

  it('reflects the saved settings and disables every switch when not editing', async () => {
    mockEmailSettings(ALL_CATEGORIES);

    renderForm(false);

    const master = await findMasterSwitch();
    expect(master).toBeChecked();
    expect(settingSwitch(strings.NURSERY)).not.toBeChecked();
    expect(settingSwitch(strings.SEED_BANK)).toBeChecked();
    for (const element of screen.getAllByRole('switch')) {
      expect(element).toBeDisabled();
    }
  });

  it('disables the category switches while email notifications are turned off', async () => {
    mockEmailSettings(ALL_CATEGORIES);

    const { user } = renderForm(true);

    const master = await findMasterSwitch();
    expect(settingSwitch(strings.SEED_BANK)).toBeEnabled();

    await user.click(master);

    expect(master).toBeEnabled();
    expect(master).not.toBeChecked();
    for (const name of [strings.SEED_BANK, strings.NURSERY, strings.PLANTING_AND_OBSERVATIONS, strings.ACCELERATOR]) {
      expect(settingSwitch(name)).toBeDisabled();
    }
  });

  it('sends the updated categories once when a category is toggled and saved', async () => {
    mockEmailSettings(ALL_CATEGORIES);
    mockProfileSaveSideEffects();
    mockPut(ME_URL);
    const emailRequests = captureRequests('put', EMAIL_SETTINGS_URL);

    const { user, returnedToView } = renderForm(true);

    await findMasterSwitch();
    await user.click(settingSwitch(strings.NURSERY));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(returnedToView()).toBe(true));
    expect(emailRequests).toHaveLength(1);
    expect(await emailRequests[0].json()).toEqual({
      categories: [
        { category: 'SeedBank', optedIn: true },
        { category: 'Nursery', optedIn: true },
        { category: 'PlantingAndObservations', optedIn: true },
        { category: 'Accelerator', optedIn: true },
      ],
      emailNotificationsEnabled: true,
    });
  });

  it('leaves email settings alone when only the profile changed', async () => {
    mockEmailSettings(ALL_CATEGORIES);
    mockProfileSaveSideEffects();
    const meRequests = captureRequests('put', ME_URL);
    // Registered so a stray write is recorded rather than failing as an unhandled request, which
    // lets the assertion below distinguish "never sent" from "sent and rejected".
    const emailRequests = captureRequests('put', EMAIL_SETTINGS_URL);

    const { user, returnedToView } = renderForm(true);

    await findMasterSwitch();
    const firstName = screen.getByDisplayValue('Ada');
    await user.clear(firstName);
    await user.type(firstName, 'Grace');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(returnedToView()).toBe(true));
    expect(meRequests).toHaveLength(1);
    const meBody = await meRequests[0].json();
    expect(meBody).toMatchObject({ firstName: 'Grace' });
    expect(meBody).not.toHaveProperty('emailNotificationsEnabled');
    expect(emailRequests).toHaveLength(0);
  });

  it('restores the saved settings when editing is cancelled', async () => {
    mockEmailSettings(ALL_CATEGORIES);
    const emailRequests = captureRequests('put', EMAIL_SETTINGS_URL);

    const { user, returnedToView } = renderForm(true);

    await user.click(await findMasterSwitch());
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(returnedToView()).toBe(true);
    expect(settingSwitch(strings.EMAIL_NOTIFICATIONS)).toBeChecked();
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
    expect(emailRequests).toHaveLength(0);
  });
});
