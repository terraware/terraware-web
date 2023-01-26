import strings from 'src/strings';
import { useOrganization } from './providers';

export interface Unit {
  label: string;
  value: 'Grams' | 'Milligrams' | 'Kilograms' | 'Pounds' | 'Seeds' | 'Ounces';
}

export function weightUnits() {
  return [
    { label: strings.G_GRAMS, value: 'Grams' },
    { label: strings.MG_MILLIGRAMS, value: 'Milligrams' },
    { label: strings.KG_KILOGRAMS, value: 'Kilograms' },
    { label: strings.LB_POUNDS, value: 'Pounds' },
    { label: strings.OZ_OUNCES, value: 'Ounces' },
  ];
}

export function weightUnitsV2(unit?: string) {
  if (unit === 'imperial') {
    return [
      { label: strings.OZ, value: 'Ounces' },
      { label: strings.LB, value: 'Pounds' },
      { label: strings.G, value: 'Grams' },
      { label: strings.MG, value: 'Milligrams' },
      { label: strings.KG, value: 'Kilograms' },
    ];
  }
  return [
    { label: strings.G, value: 'Grams' },
    { label: strings.MG, value: 'Milligrams' },
    { label: strings.KG, value: 'Kilograms' },
    { label: strings.OZ, value: 'Ounces' },
    { label: strings.LB, value: 'Pounds' },
  ];
}

export function usePreferredWeightUnits() {
  const { userPreferences } = useOrganization();
  return weightUnitsV2(userPreferences.preferredWeightSystem as string);
}

export function weightSystems() {
  return [
    { label: strings.IMPERIAL_OZ_LB, value: 'imperial' },
    { label: strings.METRIC_G_KG_MG, value: 'metric' },
  ];
}

export function weightSystemsNames() {
  return [
    { label: strings.IMPERIAL, value: 'imperial' },
    { label: strings.METRIC, value: 'metric' },
  ];
}

export type InitializedUnits = {
  units?: string;
  unitsAcknowledgedOnMs?: number;
  updated?: boolean;
};
