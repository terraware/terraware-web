import React, { type JSX } from 'react';

import { Dropdown } from '@terraware/web-components';

import strings from 'src/strings';
import { Facility } from 'src/types/Facility';

type NurseryDropdownV2Props<T extends { facilityId?: number } | undefined> = {
  availableNurseries: Facility[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
  validateFields: boolean;
};

function NurseryDropdownV2<T extends { facilityId?: number } | undefined>({
  availableNurseries,
  record,
  setRecord,
  validateFields,
}: NurseryDropdownV2Props<T>): JSX.Element {
  return (
    <Dropdown
      id='facilityId'
      label={strings.NURSERY}
      selectedValue={record?.facilityId}
      options={(availableNurseries || []).map((nursery) => ({ label: nursery.name, value: nursery.id }))}
      onChange={(facilityId: string) =>
        setRecord((previousRecord: T): T => ({ ...previousRecord, facilityId: Number(facilityId) }))
      }
      errorText={validateFields && !record?.facilityId ? strings.REQUIRED_FIELD : ''}
      fullWidth
      required
    />
  );
}

export default NurseryDropdownV2;
