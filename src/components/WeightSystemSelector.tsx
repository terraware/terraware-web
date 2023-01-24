import { Dropdown } from '@terraware/web-components';
import strings from 'src/strings';
import { weightSystems } from 'src/units';

export type WeightSystemSelectorProps = {
  onChange: (systemSelected: string) => void;
  selectedWeightSystem?: string;
};

export default function WeightSystemSelector(props: WeightSystemSelectorProps): JSX.Element {
  const { onChange, selectedWeightSystem } = props;
  return (
    <Dropdown
      onChange={(newValue) => onChange(newValue)}
      label={strings.PREFERRED_WEIGHT_SYSTEM}
      options={weightSystems()}
      selectedValue={selectedWeightSystem}
    />
  );
}
