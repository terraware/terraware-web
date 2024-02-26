import React, { useMemo } from 'react';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import { useLocalization } from 'src/providers';

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
        setRecord((previousValue) => {
          return {
            ...previousValue,
            participantId: participantId ? Number(participantId) : null,
          };
        });
      }}
      fullWidth
    />
  );
}

export default ParticipantsDropdown;
