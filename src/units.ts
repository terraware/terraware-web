import strings from 'src/strings';

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

export function getUnitsForSystem(system: string) {
  if (system === 'imperial') {
    return [
      { label: strings.LB_POUNDS, value: 'Pounds' },
      { label: strings.OZ_OUNCES, value: 'Ounces' },
    ];
  }
  return [
    { label: strings.G_GRAMS, value: 'Grams' },
    { label: strings.MG_MILLIGRAMS, value: 'Milligrams' },
    { label: strings.KG_KILOGRAMS, value: 'Kilograms' },
  ];
}

export function convertValue(value: number, unit: string) {
  switch (unit) {
    case 'Grams': {
      return `${(value * 0.035274).toPrecision(2)} Ounces`;
    }
    case 'Kilograms': {
      return `${(value * 2.20462).toPrecision(2)} Pounds`;
    }
    case 'Milligrams': {
      return `${(value * 0.000035274).toPrecision(2)} Ounces`;
    }
    case 'Pounds': {
      return `${(value * 0.453592).toPrecision(2)} Kilograms`;
    }
    case 'Ounces': {
      return `${(value * 28.3495).toPrecision(2)} Grams`;
    }
    default: {
      return `${value} ${unit}`;
    }
  }
}

export function isUnitInPreferredSystem(unit: string, system: string) {
  const units = getUnitsForSystem(system);
  const found = units.find((iUnit) => iUnit.value === unit);
  return !!found;
}
