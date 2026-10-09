import { DropdownItem } from '@terraware/web-components';

import {
  ParticipantProjectForSpeciesPayload,
  ParticipantProjectSpeciesPayload,
  SpeciesForParticipantProjectPayload,
} from 'src/queries/generated/acceleratorProjectSpecies';
import strings from 'src/strings';

export type AcceleratorProjectSpecies = ParticipantProjectSpeciesPayload;
export type SpeciesNativeCategory = AcceleratorProjectSpecies['speciesNativeCategory'];
export type AcceleratorProjectForSpecies = ParticipantProjectForSpeciesPayload;
export type SpeciesForAcceleratorProject = SpeciesForParticipantProjectPayload;

const getSpeciesNativeCategoryLabel = (value: SpeciesNativeCategory): string => {
  switch (value) {
    case 'Native':
      return strings.NATIVE;
    case 'Non-native':
      return strings.NON_NATIVE;
    default:
      return `${value}`;
  }
};

export const getSpeciesNativeCategoryOptions = (
  activeLocale: string | null
): (Omit<DropdownItem, 'value'> & { value: SpeciesNativeCategory })[] =>
  activeLocale
    ? [
        {
          label: getSpeciesNativeCategoryLabel('Native'),
          value: 'Native',
        },
        {
          label: getSpeciesNativeCategoryLabel('Non-native'),
          value: 'Non-native',
        },
      ]
    : [];
