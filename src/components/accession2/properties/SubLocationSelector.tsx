import React from 'react';
import strings from 'src/strings';
import { Select } from '@terraware/web-components';

type SubLocationSelectorProps = {
  id?: string;
  label: string;
  selectedSubLocation?: string;
  subLocations: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function SubLocationSelector(props: SubLocationSelectorProps): JSX.Element {
  const { id, label, selectedSubLocation, subLocations, onChange, disabled } = props;

  return (
    <Select
      id={id}
      label={label}
      placeholder={strings.SELECT}
      options={subLocations}
      onChange={onChange}
      selectedValue={selectedSubLocation}
      fullWidth={true}
      tooltipTitle={strings.TOOLTIP_ACCESSIONS_SUBLOCATION}
      disabled={disabled}
    />
  );
}
