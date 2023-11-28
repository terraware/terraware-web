import React from 'react';
import { Dropdown } from '@terraware/web-components';
import strings from 'src/strings';
import { Species } from 'src/types/Species';

type SpeciesDropdownProps<T extends { speciesId?: number } | undefined> = {
  availableSpecies: Species[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
  validateFields: boolean;
};

function SpeciesDropdown<T extends { speciesId?: number } | undefined>({
  availableSpecies,
  record,
  setRecord,
  validateFields,
}: SpeciesDropdownProps<T>) {
  return (
    <Dropdown
      id='speciesId'
      label={strings.SPECIES}
      selectedValue={record?.speciesId}
      options={(availableSpecies || []).map((species) => ({ label: species.scientificName, value: species.id }))}
      onChange={(speciesId: string) =>
        setRecord((previousValue) => ({ ...previousValue, speciesId: Number(speciesId) }))
      }
      errorText={validateFields && !record?.speciesId ? strings.REQUIRED_FIELD : ''}
      fullWidth
      required
    />
  );
}

export default SpeciesDropdown;
