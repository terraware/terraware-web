import { ILocalizedStrings } from 'src/strings';
import { SeedWithdrawalPurpose } from 'src/types/Accession';

export function withdrawalPurposes(strings: ILocalizedStrings) {
  return [
    { label: strings.NURSERY, value: 'Nursery' },
    { label: strings.PLANTING, value: 'Out-planting' },
    { label: strings.VIABILITY_TESTING, value: 'Viability Testing' },
    { label: strings.OTHER, value: 'Other' },
  ];
}

export const SeedWithdrawalPurposes: SeedWithdrawalPurpose[] = [
  'Nursery',
  'Out-planting',
  'Viability Testing',
  'Other',
];

export const seedWithdrawalPurposeLabel = (
  purpose: SeedWithdrawalPurpose | undefined,
  strings: ILocalizedStrings
): string => {
  switch (purpose) {
    case 'Nursery':
      return strings.NURSERY;
    case 'Out-planting':
      return strings.PLANTING;
    case 'Viability Testing':
      return strings.VIABILITY_TESTING;
    default:
      return strings.OTHER;
  }
};
