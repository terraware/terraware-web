import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import collectorsSelector from '../../../state/selectors/collectors';
import strings from '../../../strings';
import Autocomplete from '../../common/Autocomplete';

interface Props {
  onChange: (id: string, value: unknown) => void;
  mainCollector?: string;
}

export default function MainCollectorDropdown({
  mainCollector,
  onChange,
}: Props): JSX.Element {
  const collectors = useRecoilValue(collectorsSelector);
  const resetCollectors = useResetRecoilState(collectorsSelector);

  React.useEffect(() => {
    return () => {
      resetCollectors();
    };
  }, [resetCollectors]);

  return (
    <Autocomplete
      id='primaryCollector'
      selected={mainCollector}
      onChange={onChange}
      label={strings.PRIMARY_COLLECTOR}
      values={collectors.filter((collector) => collector !== null)}
    />
  );
}
