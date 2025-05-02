import React, { useMemo } from 'react';

import strings from 'src/strings';

import ProjectFieldMultiSelect from './MultiSelect';
import { ProjectFieldEditProps } from './index';

type SdgMultiSelectProps = Omit<ProjectFieldEditProps, 'onChange' | 'value'> & {
  onChange: (id: string, values: string[]) => void;
  value: string[] | number[] | undefined;
};
const SdgMultiSelect = ({ id, label, onChange, value, md, height }: SdgMultiSelectProps) => {
  const options = useMemo(
    (): Map<string, string> =>
      new Map([
        ['1', strings.SDG_01],
        ['2', strings.SDG_02],
        ['3', strings.SDG_03],
        ['4', strings.SDG_04],
        ['5', strings.SDG_05],
        ['6', strings.SDG_06],
        ['7', strings.SDG_07],
        ['8', strings.SDG_08],
        ['9', strings.SDG_09],
        ['10', strings.SDG_10],
        ['11', strings.SDG_11],
        ['12', strings.SDG_12],
        ['13', strings.SDG_13],
        ['14', strings.SDG_14],
        ['15', strings.SDG_15],
        ['16', strings.SDG_16],
        ['17', strings.SDG_17],
      ]),
    []
  );

  return (
    <ProjectFieldMultiSelect
      id={id}
      md={md}
      height={height}
      label={label}
      onChange={onChange}
      values={value?.map((v) => v.toString())}
      options={options}
    />
  );
};

export default SdgMultiSelect;
