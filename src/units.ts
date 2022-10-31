import strings from 'src/strings';

export interface Unit {
  label: string;
  value: 'Grams' | 'Milligrams' | 'Kilograms' | 'Pounds' | 'Seeds' | 'Ounces';
}

export const WEIGHT_UNITS: Unit[] = [
  { label: strings.G_GRAMS, value: 'Grams' },
  { label: strings.MG_MILLIGRAMS, value: 'Milligrams' },
  { label: strings.KG_KILOGRAMS, value: 'Kilograms' },
  { label: strings.LB_POUNDS, value: 'Pounds' },
  { label: strings.OZ_OUNCES, value: 'Ounces' },
];

export const WEIGHT_UNITS_V2: Unit[] = [
  { label: strings.G, value: 'Grams' },
  { label: strings.MG, value: 'Milligrams' },
  { label: strings.KG, value: 'Kilograms' },
  { label: strings.LB, value: 'Pounds' },
  { label: strings.OZ, value: 'Ounces' },
];
