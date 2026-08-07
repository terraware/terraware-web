import strings from 'src/strings';
import { SpeciesProjectElement } from 'src/types/Species';

export type Nativity = NonNullable<SpeciesProjectElement['calculatedNativity']>;

export const getNativityLabel = (nativity: Nativity): string => {
  switch (nativity) {
    case 'Native':
      return strings.NATIVE;
    case 'Introduced':
      return strings.INTRODUCED;
    case 'Invasive':
      return strings.INVASIVE;
    case 'Unknown':
      return strings.UNKNOWN;
  }
};

export type LocationEdit = {
  countryCode?: string;
  botanicalCountryCode?: string;
};

export type LocationTarget = {
  key: number;
  projectId?: number;
  name: string;
  countryCode?: string;
  botanicalCountryCode?: string;
  isOrg: boolean;
};

export const ORG_TARGET_KEY = -1;

export type OverrideEdit = {
  nativity?: Nativity;
  justification?: string;
};

export const NATIVITY_VALUES: Nativity[] = ['Native', 'Introduced', 'Invasive', 'Unknown'];

export const projectSpeciesKey = (projectId: number, speciesId: number): string => `${projectId}-${speciesId}`;
