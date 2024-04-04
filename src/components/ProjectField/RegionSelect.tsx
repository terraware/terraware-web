import { useMemo } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { REGIONS } from 'src/types/ParticipantProject';

import { ProjectFieldEditProps } from '.';
import ProjectFieldSelect from './Select';

const RegionSelect = ({ id, label, onChange, value }: ProjectFieldEditProps) => {
  const { activeLocale } = useLocalization();

  const options = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? REGIONS().map(({ region, label: strLabel }) => ({
            label: strLabel,
            value: region,
          }))
        : [],
    [activeLocale]
  );

  return <ProjectFieldSelect id={id} label={label} onChange={onChange} value={value} options={options} />;
};

export default RegionSelect;
