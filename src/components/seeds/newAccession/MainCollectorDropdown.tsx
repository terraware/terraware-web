import React, { useEffect, useState } from 'react';
import { getPrimaryCollectors } from 'src/api/seeds/search';
import strings from 'src/strings';
import Autocomplete from 'src/components/common/Autocomplete';

interface MainCollectorDropdownProps {
  organizationId: number;
  onChange: (id: string, value: unknown) => void;
  mainCollector?: string;
  disabled?: boolean;
}

export default function MainCollectorDropdown(props: MainCollectorDropdownProps): JSX.Element {
  const { organizationId, onChange, mainCollector, disabled } = props;
  const [collectors, setCollectors] = useState<string[] | null>([]);

  useEffect(() => {
    const populateCollectors = async () => {
      setCollectors(await getPrimaryCollectors(organizationId));
    };
    populateCollectors();
  }, [organizationId]);

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
      disabled={disabled}
      freeSolo={true}
    />
  );
}
