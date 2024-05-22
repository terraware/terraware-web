import { DropdownItem } from '@terraware/web-components';

import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

// These will all change when the BE is done, some of the props might even come from different models
export type ParticipantProjectSpecies = components['schemas']['ParticipantProjectSpeciesPayload'];
export type SubmissionStatus = ParticipantProjectSpecies['submissionStatus'];
export type SpeciesNativeCategory = ParticipantProjectSpecies['speciesNativeCategory'];

export const getSpeciesNativeCategoryLabel = (value: SpeciesNativeCategory): string => {
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
