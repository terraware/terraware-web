import { useMemo } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { REGIONS, getRegion } from 'src/types/ParticipantProject';

import { ProjectFieldEditProps } from '.';
import ProjectFieldSelect from './Select';

const RegionSelect = ({ id, label, onChange, value }: ProjectFieldEditProps) => {
  const options = useMemo(
    (): DropdownItem[] =>
      REGIONS.map((value) => ({
        label: getRegion(value),
        value,
      })),
    []
  );

  return <ProjectFieldSelect id={id} label={label} onChange={onChange} value={value} options={options} />;
};

export default RegionSelect;
