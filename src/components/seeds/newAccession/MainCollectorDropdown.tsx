import React, { useEffect, useState } from 'react';
import { getPrimaryCollectors } from 'src/api/seeds/search';
import strings from 'src/strings';
import Autocomplete from 'src/components/common/Autocomplete';

interface MainCollectorDropdownProps {
  facilityId: number;
  onChange: (id: string, value: unknown) => void;
  mainCollector?: string;
}

export default function MainCollectorDropdown(props: MainCollectorDropdownProps): JSX.Element {
  const { facilityId, onChange, mainCollector } = props;
  const [collectors, setCollectors] = useState<string[] | null>([]);

  useEffect(() => {
    const populateCollectors = async () => {
      setCollectors(await getPrimaryCollectors(facilityId));
    };
    populateCollectors();
  }, [facilityId]);

  // TODO: clean up this error handling
  if (collectors === null) {
    return <div>strings.GENERIC_ERROR</div>;
  }

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
