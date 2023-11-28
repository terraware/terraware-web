import { MultiSelect } from '@terraware/web-components';
import strings from '../../../strings';
import { SubLocation } from '../../../types/Facility';
import React from 'react';

type SubLocationsDropdownProps<T extends { subLocationIds?: number[] } | undefined> = {
  availableSubLocations: SubLocation[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function SubLocationsDropdown<T extends { subLocationIds?: number[] } | undefined>({
  availableSubLocations,
  record,
  setRecord,
}: SubLocationsDropdownProps<T>) {
  return (
    <MultiSelect<number, string>
      fullWidth={true}
      label={strings.SUB_LOCATIONS}
      onAdd={(subLocationId: number) => {
        setRecord((previousValue) => ({
          ...previousValue,
          subLocationIds: [...(previousValue?.subLocationIds || []), Number(subLocationId)],
        }));
      }}
      onRemove={(subLocationId: number) => {
        setRecord((previousValue) => ({
          ...previousValue,
          subLocationIds: previousValue?.subLocationIds?.filter((id: number) => id !== subLocationId) || [],
        }));
      }}
      options={new Map(availableSubLocations?.map((subLocation) => [subLocation.id, subLocation.name]))}
      valueRenderer={(val: string) => val}
      selectedOptions={record?.subLocationIds || []}
      placeHolder={strings.SELECT}
    />
  );
}

export default SubLocationsDropdown;
