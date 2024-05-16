import { DropdownItem } from '@terraware/web-components';

import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

// These will all change when the BE is done, some of the props might even come from different models
export type ParticipantProjectSpecies = components['schemas']['ParticipantProjectSpeciesPayload'];
export type SubmissionStatus = ParticipantProjectSpecies['submissionStatus'];
export type NativeNonNative = ParticipantProjectSpecies['nativeNonNative'];

export const getNativeNonNativeLabel = (value: NativeNonNative): string => {
  switch (value) {
    case 'Native':
      return strings.NATIVE;
    case 'Non-native':
      return strings.NON_NATIVE;
    default:
      return `${value}`;
  }
};

export const getNativeNonNativeOptions = (
  activeLocale: string | null
): (Omit<DropdownItem, 'value'> & { value: NativeNonNative })[] =>
  activeLocale
    ? [
        {
          label: getNativeNonNativeLabel('Native'),
          value: 'Native',
        },
        {
          label: getNativeNonNativeLabel('Non-native'),
          value: 'Non-native',
        },
      ]
    : [];
