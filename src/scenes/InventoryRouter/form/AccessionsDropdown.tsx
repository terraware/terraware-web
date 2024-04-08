import React, { useEffect } from 'react';

import { Dropdown } from '@terraware/web-components';

import { SearchResponseAccession } from 'src/services/SeedBankService';
import strings from 'src/strings';

type AccessionsDropdownProps<T extends { accessionId?: number; speciesId?: number } | undefined> = {
  availableAccessions: SearchResponseAccession[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

function AccessionsDropdown<T extends { accessionId?: number; speciesId?: number } | undefined>({
  availableAccessions,
  record,
  setRecord,
}: AccessionsDropdownProps<T>) {
  // Since accession is dependent on species, if the record's species has changed, reset the accession
  useEffect(() => {
    setRecord((previousValue) => ({
      ...previousValue,
      accessionId: undefined,
    }));
  }, [record?.speciesId, setRecord]);

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
      tooltipTitle={strings.TOOLTIP_INVENTORY_ADD_ACCESSION_ID}
      disabled={(availableAccessions && availableAccessions.length === 0) || (record && record.speciesId === undefined)}
      fullWidth
    />
  );
}

export default AccessionsDropdown;
