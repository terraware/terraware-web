import React from 'react';
import strings from 'src/strings';
import { StorageLocationDetails } from 'src/api/types/facilities';
import { SelectT } from '@terraware/web-components';

type StorageSubLocationSelectorProps = {
  label: string;
  selectedStorageSubLocation: StorageLocationDetails | undefined;
  storageSubLocations: StorageLocationDetails[];
  onChange: (value: StorageLocationDetails) => void;
  readonly: boolean;
};

export default function StorageSubLocationSelector(props: StorageSubLocationSelectorProps): JSX.Element {
  const { label, selectedStorageSubLocation, storageSubLocations, onChange, readonly } = props;

  return (
    <SelectT<StorageLocationDetails>
      label={label}
      placeholder={strings.SELECT}
      options={storageSubLocations}
      onChange={onChange}
      isEqual={(a: StorageLocationDetails, b: StorageLocationDetails) => a.storageLocation === b.storageLocation}
      renderOption={(details) => details.storageLocation}
      displayLabel={(details) => details?.storageLocation || ''}
      selectedValue={selectedStorageSubLocation}
      toT={(name: string) => ({ storageLocation: name } as StorageLocationDetails)}
      fullWidth={true}
      readonly={readonly}
    />
  );
}
