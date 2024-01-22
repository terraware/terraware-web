import React from 'react';
import Dropdown from 'src/components/common/SpeciesSelector';

type SpeciesDropdownProps<T extends { speciesId?: number } | undefined> = {
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
  validateFields: boolean;
};

function SpeciesDropdown<T extends { speciesId?: number } | undefined>({
  record,
  setRecord,
  validateFields,
}: SpeciesDropdownProps<T>) {
  return <Dropdown record={record} setRecord={setRecord} validate={validateFields} />;
}

export default SpeciesDropdown;
