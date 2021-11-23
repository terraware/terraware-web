import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Autocomplete from '../../common/Autocomplete';
import { findPrimaryCollectors } from '../../../api/seeds/search';

interface MainCollectorDropdownProps {
  facilityId: number;
  onChange: (id: string, value: unknown) => void;
  mainCollector?: string;
}

export default function MainCollectorDropdown(props: MainCollectorDropdownProps): JSX.Element {
  const { facilityId, onChange, mainCollector } = props;
  const [collectors, setCollectors] = useState<string[]>([]);

  useEffect(() => {
    const populateCollectors = async () => {
      setCollectors(await findPrimaryCollectors(facilityId));
    };
    populateCollectors();
  }, [facilityId]);

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
