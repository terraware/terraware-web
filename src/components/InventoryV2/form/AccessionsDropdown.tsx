import React from 'react';
import { Dropdown } from '@terraware/web-components';
import strings from 'src/strings';
import { SearchResponseAccession } from './useAccessions';

type AccessionsDropdownProps<T extends { accessionId?: number } | undefined> = {
  availableAccessions: SearchResponseAccession[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function AccessionsDropdown<T extends { accessionId?: number } | undefined>({
  availableAccessions,
  record,
  setRecord,
}: AccessionsDropdownProps<T>) {
  return (
    <Dropdown
      id='accessionId'
      label={strings.ACCESSION}
      selectedValue={record?.accessionId}
      options={(availableAccessions || []).map((accession) => ({
        label: `${accession.accessionNumber}`,
        value: Number(accession.id),
      }))}
      onChange={(accessionId: string) =>
        setRecord((previousValue) => ({
          ...previousValue,
          accessionId: Number(accessionId),
        }))
      }
      fullWidth
    />
  );
}

export default AccessionsDropdown;
