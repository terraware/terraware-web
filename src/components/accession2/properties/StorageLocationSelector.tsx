import React from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { SelectT } from '@terraware/web-components';

type StorageLocationSelectorProps = {
  label: string;
  selectedStorageLocation?: Facility;
  storageLocations: Facility[];
  onChange: (value: Facility) => void;
  errorText?: string;
};

export default function StorageLocationSelector(props: StorageLocationSelectorProps): JSX.Element {
  const { label, selectedStorageLocation, storageLocations, onChange, errorText } = props;

  return (
    <SelectT<Facility>
      label={label}
      placeholder={strings.SELECT}
      options={storageLocations}
      onChange={onChange}
      isEqual={(a: Facility, b: Facility) => a.id === b.id}
      renderOption={(facility) => facility.name}
      displayLabel={(facility) => facility?.name || ''}
      selectedValue={selectedStorageLocation}
      toT={(name: string) => ({ name } as Facility)}
      fullWidth={true}
      readonly={true}
      errorText={errorText}
      tooltipTitle={strings.TOOLTIP_ACCESSIONS_LOCATION}
    />
  );
}
