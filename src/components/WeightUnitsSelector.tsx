import React, { type JSX } from 'react';

import { Dropdown } from '@terraware/web-components';
import { SelectStyles } from '@terraware/web-components/components/Select/SelectT';

import strings from 'src/strings';
import { usePreferredWeightUnits } from 'src/units';

export type WeightUnitsSelectorProps = {
  onChange: (newValue: string) => void;
  selectedValue: any;
  id?: string;
  label?: string;
  selectStyles?: SelectStyles;
};

export default function WeightUnitsSelector(props: WeightUnitsSelectorProps): JSX.Element {
  const { onChange, selectedValue, id, label, selectStyles } = props;
  const preferredUnits = usePreferredWeightUnits();

  return (
    <Dropdown
      id={id}
      label={label}
      options={preferredUnits}
      placeholder={strings.SELECT}
      onChange={onChange}
      selectedValue={selectedValue}
      fullWidth={true}
      selectStyles={selectStyles}
    />
  );
}
