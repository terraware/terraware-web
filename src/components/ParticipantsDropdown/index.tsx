import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { ParticipantSearchResult } from 'src/types/Participant';

type ParticipantsDropdownProps<T extends { id?: number } | undefined> = {
  allowUnselect?: boolean;
  availableParticipants: ParticipantSearchResult[] | undefined;
  label?: string | undefined;
  record: T;
  required?: boolean;
  setRecord: (setFn: (previousValue: T) => T) => void;
  unselectLabel?: string;
};

function ParticipantsDropdown<T extends { id?: number } | undefined>({
  allowUnselect,
  availableParticipants,
  label,
  record,
  required,
  setRecord,
  unselectLabel,
}: ParticipantsDropdownProps<T>) {
  const { activeLocale } = useLocalization();

  const participantOptions = useMemo(() => {
    const options: DropdownItem[] = [];

    if (!activeLocale) {
      return [];
    }

    if (allowUnselect) {
      options.push({
        label: unselectLabel ?? strings.NO_PARTICIPANT,
        value: undefined,
      });
    }

    return [
      ...options,
      ...(availableParticipants || []).map((participant) => ({
        label: participant.name,
        value: participant.id,
      })),
    ];
  }, [activeLocale, allowUnselect, availableParticipants, unselectLabel]);

  return (
    <Dropdown
      id='participantId'
      label={label === '' ? label : strings.PARTICIPANT}
      selectedValue={record?.id}
      options={participantOptions}
      onChange={(participantId: string) => {
        setRecord((previousValue: T): T => {
          if (!participantId) {
            return {
              ...previousValue,
              id: undefined,
            };
          }

          return {
            ...previousValue,
            id: Number(participantId),
          };
        });
      }}
      fullWidth
      required={required}
    />
  );
}

export default ParticipantsDropdown;
