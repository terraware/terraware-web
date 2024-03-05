import React, { useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';

type ParticipantsDropdownProps<T extends { participantId?: number } | undefined> = {
  allowUnselect?: boolean;
  availableParticipants: Participant[] | undefined;
  label?: string | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function ParticipantsDropdown<T extends { participantId?: number } | undefined>({
  allowUnselect,
  availableParticipants,
  label,
  record,
  setRecord,
}: ParticipantsDropdownProps<T>) {
  const { activeLocale } = useLocalization();

  const participantOptions = useMemo(() => {
    const options: DropdownItem[] = [];

    if (!activeLocale) {
      return [];
    }

    if (allowUnselect) {
      options.push({
        label: strings.NO_PARTICIPANT,
        value: '',
      });
    }

    return [
      ...options,
      ...(availableParticipants || []).map((participant) => ({
        label: participant.name,
        value: participant.id,
      })),
    ];
  }, [activeLocale, allowUnselect, availableParticipants]);

  return (
    <Dropdown
      id='participantId'
      label={label === '' ? label : strings.PARTICIPANT}
      selectedValue={record?.participantId}
      options={participantOptions}
      onChange={(participantId: string) => {
        setRecord((previousValue: T): T => {
          if (participantId === '') {
            if (previousValue) {
              return {
                ...previousValue,
                participantId: undefined,
              };
            } else {
              return previousValue;
            }
          }

          return {
            ...previousValue,
            participantId: Number(participantId),
          };
        });
      }}
      fullWidth
    />
  );
}

export default ParticipantsDropdown;
