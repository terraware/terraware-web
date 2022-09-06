import React from 'react';
import strings from 'src/strings';
import { Select } from '@terraware/web-components';

type StorageSubLocationSelectorProps = {
  label: string;
  selectedStorageSubLocation?: string;
  storageSubLocations: string[];
  onChange: (value: string) => void;
  readonly: boolean;
};

export default function StorageSubLocationSelector(props: StorageSubLocationSelectorProps): JSX.Element {
  const { label, selectedStorageSubLocation, storageSubLocations, onChange, readonly } = props;

  return (
    <Select
      label={label}
      placeholder={strings.SELECT}
      options={storageSubLocations}
      onChange={onChange}
      selectedValue={selectedStorageSubLocation}
      fullWidth={true}
      readonly={readonly}
    />
  );
}
