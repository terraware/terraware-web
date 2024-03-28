import { useMemo } from 'react';

import { LAND_USE_MODEL_TYPES, getLandUseModelType } from 'src/types/ParticipantProject';

import { ProjectFieldEditProps } from '.';
import ProjectFieldMultiSelect from './MultiSelect';

type LandUseMultiSelectProps = Omit<ProjectFieldEditProps, 'onChange' | 'value'> & {
  onChange: (id: string, values: string[]) => void;
  value: string[] | undefined;
};

const LandUseMultiSelect = ({ id, label, onChange, value }: LandUseMultiSelectProps) => {
  const options = useMemo(
    (): Map<string, string> => new Map(LAND_USE_MODEL_TYPES.map((value) => [getLandUseModelType(value), value])),
    []
  );

  return <ProjectFieldMultiSelect id={id} label={label} onChange={onChange} values={value} options={options} />;
};

export default LandUseMultiSelect;
