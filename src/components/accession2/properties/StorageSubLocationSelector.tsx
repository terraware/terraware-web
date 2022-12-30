import React from 'react';
import strings from 'src/strings';
import { Select } from '@terraware/web-components';

type StorageSubLocationSelectorProps = {
  id?: string;
  label: string;
  selectedStorageSubLocation?: string;
  storageSubLocations: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function StorageSubLocationSelector(props: StorageSubLocationSelectorProps): JSX.Element {
  const { label, selectedStorageSubLocation, storageSubLocations, onChange, disabled } = props;

  return (
    <Select
      label={label}
      placeholder={strings.SELECT}
      options={storageSubLocations}
      onChange={onChange}
      selectedValue={selectedStorageSubLocation}
      fullWidth={true}
      tooltipTitle={strings.TOOLTIP_ACCESSIONS_SUBLOCATION}
      disabled={disabled}
    />
  );
}
