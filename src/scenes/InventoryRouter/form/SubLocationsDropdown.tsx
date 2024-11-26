import React from 'react';

import { MultiSelect } from '@terraware/web-components';

import strings from 'src/strings';
import { SubLocation } from 'src/types/Facility';

type SubLocationsDropdownProps<T extends { subLocationIds?: number[] } | undefined> = {
  availableSubLocations: SubLocation[] | undefined;
  minimal?: boolean;
  onBlur?: (nextRecord: T) => void;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function SubLocationsDropdown<T extends { subLocationIds?: number[] } | undefined>({
  availableSubLocations,
  minimal,
  onBlur,
  record,
  setRecord,
}: SubLocationsDropdownProps<T>) {
  const handleOnBlur = () => {
    if (onBlur) {
      onBlur(record);
    }
  };

  return (
    <MultiSelect<number, string>
      fullWidth={true}
      label={!minimal ? strings.SUB_LOCATIONS : undefined}
      onAdd={(subLocationId: number) => {
        setRecord((previousValue) => ({
          ...previousValue,
          subLocationIds: [...(previousValue?.subLocationIds || []), Number(subLocationId)],
        }));
      }}
      onRemove={(subLocationId: number) => {
        setRecord((previousValue) => {
          const nextRecord = {
            ...previousValue,
            subLocationIds: previousValue?.subLocationIds?.filter((id: number) => id !== subLocationId) || [],
          };

          if (onBlur) {
            onBlur(nextRecord);
          }

          return nextRecord;
        });
      }}
      options={new Map(availableSubLocations?.map((subLocation) => [subLocation.id, subLocation.name]))}
      valueRenderer={(val: string) => val}
      selectedOptions={record?.subLocationIds || []}
      sx={{
        height: '100%',
        width: '100%',
      }}
      placeHolder={strings.SELECT}
      onBlur={handleOnBlur}
    />
  );
}

export default SubLocationsDropdown;
