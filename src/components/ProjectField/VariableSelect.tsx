import React, { useMemo } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { SelectOptionPayload } from 'src/types/documentProducer/Variable';

import ProjectFieldSelect from './Select';
import { ProjectFieldEditProps } from './index';

type VariableSelectProps = ProjectFieldEditProps & {
  options: SelectOptionPayload[];
};

const VariableSelect = ({ id, label, onChange, options, value, md }: VariableSelectProps) => {
  const dropdownOptions = useMemo(
    (): DropdownItem[] =>
      options?.map((option: SelectOptionPayload) => ({ label: option.name, value: option.name })) || [],
    [options]
  );

  return (
    <ProjectFieldSelect id={id} md={md} label={label} onChange={onChange} value={value} options={dropdownOptions} />
  );
};

export default VariableSelect;
