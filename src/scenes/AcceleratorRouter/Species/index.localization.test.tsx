import React from 'react';

import { screen } from '@testing-library/react';

import { AcceleratorProjectSpeciesContext } from 'src/providers/AcceleratorProject/AcceleratorProjectSpeciesContext';
import { LocalizationContext } from 'src/providers/contexts';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { buildSpecies, renderWithProviders } from 'src/test-utils';
import { setTestLocale } from 'src/test-utils/setupStrings';

import SpeciesDetailView from './index';

const LocalizedDetail = ({ locale }: { locale: string }) => {
  const localization = useLocalization();
  return (
    <LocalizationContext.Provider value={{ ...localization, activeLocale: locale, selectedLocale: locale }}>
      <AcceleratorProjectSpeciesContext.Provider
        value={{
          currentSpecies: buildSpecies({
            growthForms: ['Tree'],
            successionalGroups: ['Pioneer'],
            ecosystemTypes: ['Mangroves'],
            seedStorageBehavior: 'Orthodox',
            plantMaterialSourcingMethods: ['Seedling purchase'],
          }),
          currentAcceleratorProjectSpecies: {
            id: 1,
            projectId: 1,
            speciesId: 1,
            speciesNativeCategory: 'Native',
            submissionStatus: 'Approved',
            rationale: '',
          },
          isBusy: false,
          acceleratorProjectSpeciesId: 1,
          reload: () => undefined,
          update: () => undefined,
        }}
      >
        <SpeciesDetailView />
      </AcceleratorProjectSpeciesContext.Provider>
    </LocalizationContext.Provider>
  );
};

it('translates Accelerator species categories and refreshes them when the language changes', () => {
  const { rerender } = renderWithProviders(<LocalizedDetail locale='en' />);
  for (const locale of ['en', 'es', 'fr']) {
    setTestLocale(locale);
    rerender(<LocalizedDetail locale={locale} />);
    for (const label of [
      strings.NATIVE,
      strings.TREE,
      strings.SUCCESSIONAL_GROUP_PIONEER,
      strings.ECOSYSTEM_MANGROVE,
      strings.ORTHODOX,
      strings.PLANT_MATERIAL_SOURCE_METHOD_SEEDLING_PURCHASE,
    ]) {
      expect(screen.getByText(label, { exact: true })).toBeVisible();
    }
  }
});
