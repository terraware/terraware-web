import React, { ReactNode, useMemo } from 'react';
import LocalizedStrings from 'react-localization';

import { getStrings as getComponentStrings } from '@terraware/web-components';
import { screen, within } from '@testing-library/react';

import SdgMultiSelect from 'src/components/ProjectField/SdgMultiSelect';
import UserMenu from 'src/components/UserMenu';
import { useLocalization } from 'src/providers';
import { LocalizationContext } from 'src/providers/contexts';
import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';
import PlantingDateRequestStatusBadge from 'src/scenes/NurseryRouter/PlantingSeasons/PlantingDateRequestStatusBadge';
import strings from 'src/strings';
import { strings as english } from 'src/strings/strings-en';
import { strings as spanish } from 'src/strings/strings-es';
import { strings as french } from 'src/strings/strings-fr';
import { buildBatchSearchRow, mockGet, renderWithProviders } from 'src/test-utils';
import { setTestLocale } from 'src/test-utils/setupStrings';

import DocumentHistoryTab from '../scenes/AcceleratorRouter/Documents/DocumentView/DocumentHistoryTab';

const catalogs = { en: english, es: spanish, fr: french };
type Locale = keyof typeof catalogs;

const InLocale = ({ locale, children }: { locale: Locale; children: ReactNode }) => {
  const localization = useLocalization();
  const localizedStrings = useMemo(
    () =>
      new LocalizedStrings({
        [locale]: { ...getComponentStrings(), ...catalogs[locale] },
      }),
    [locale]
  );
  return (
    <LocalizationContext.Provider
      value={{ ...localization, activeLocale: locale, selectedLocale: locale, strings: localizedStrings }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

it('refreshes account menu items and request badges without changing the user or status', async () => {
  const content = (
    <>
      <UserMenu />
      <PlantingDateRequestStatusBadge status='Fulfilled' />
    </>
  );
  const { user, rerender } = renderWithProviders(<InLocale locale='en'>{content}</InLocale>);
  await user.click(screen.getByText('Test User'));
  for (const locale of ['en', 'es', 'fr'] as const) {
    setTestLocale(locale);
    rerender(<InLocale locale={locale}>{content}</InLocale>);
    expect(screen.getByText(strings.MY_ACCOUNT, { exact: true })).toBeVisible();
    expect(screen.getByText(strings.FULFILLED, { exact: true })).toBeVisible();
  }
});

it('refreshes sustainable development goal options without remounting', async () => {
  const content = <SdgMultiSelect id='sdgs' label='SDGs' value={[]} onChange={() => undefined} />;
  const { user, rerender } = renderWithProviders(<InLocale locale='en'>{content}</InLocale>);
  await user.click(document.querySelector('.multi-select__values')!);
  for (const locale of ['en', 'es', 'fr'] as const) {
    setTestLocale(locale);
    rerender(<InLocale locale={locale}>{content}</InLocale>);
    expect(screen.getByText(strings.SDG_01, { exact: true })).toBeVisible();
    expect(screen.getByText(strings.SDG_17, { exact: true })).toBeVisible();
  }
});

it('refreshes quantity-change titles and growth phases while preserving the entered quantity', async () => {
  const content = (
    <ChangeQuantityModal
      modalValues={{ type: 'germinating', openChangeQuantityModal: true }}
      onClose={() => undefined}
      row={buildBatchSearchRow(
        {},
        { germinatingQuantity: 20, activeGrowthQuantity: 30, hardeningOffQuantity: 40, readyQuantity: 50 }
      )}
    />
  );
  const { user, rerender } = renderWithProviders(<InLocale locale='en'>{content}</InLocale>);
  const input = document.querySelector<HTMLInputElement>('#movedValue input')!;
  await user.type(input, '5');
  for (const locale of ['en', 'es', 'fr'] as const) {
    setTestLocale(locale);
    rerender(<InLocale locale={locale}>{content}</InLocale>);
    expect(screen.getByRole('dialog', { name: strings.CHANGE_GERMINATION_ESTABLISHMENT_STATUS })).toBeVisible();
    expect(screen.getByText(strings.GERMINATION_ESTABLISHMENT, { exact: true })).toBeVisible();
    expect(input).toHaveValue(5);
    await user.click(document.querySelector('#nextGrowthPhase input')!);
    const options = within(await screen.findByRole('list'));
    expect(options.getByText(strings.READY_TO_PLANT)).toBeVisible();
    await user.click(options.getByText(strings.ACTIVE_GROWTH));
  }
});

it('translates document history events and headers without changing the event data', async () => {
  mockGet('/api/v1/document-producer/documents/-1/history', {
    history: [
      { type: 'Created', createdTime: '2026-01-01T10:00:00Z', createdBy: 0 },
      { type: 'Edited', createdTime: '2026-01-02T10:00:00Z', createdBy: 0 },
      {
        type: 'Saved',
        createdTime: '2026-01-03T10:00:00Z',
        createdBy: 0,
        name: 'Version 1',
        versionId: 1,
        isSubmitted: true,
        maxVariableValueId: 1,
        variableManifestId: 1,
      },
    ],
  });
  const { rerender } = renderWithProviders(
    <InLocale locale='en'>
      <DocumentHistoryTab />
    </InLocale>
  );
  await screen.findByText('Version 1');
  for (const locale of ['en', 'es', 'fr'] as const) {
    setTestLocale(locale);
    rerender(
      <InLocale locale={locale}>
        <DocumentHistoryTab />
      </InLocale>
    );
    expect(screen.getByRole('columnheader', { name: new RegExp(strings.VERSION_NAME, 'i') })).toBeVisible();
    for (const label of [strings.CREATED, strings.EDITED, strings.SAVED]) {
      expect(screen.getByRole('cell', { name: label })).toBeVisible();
    }
  }
});
