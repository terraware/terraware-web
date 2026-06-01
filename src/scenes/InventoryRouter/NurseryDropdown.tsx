import React, { type JSX } from 'react';

import { Dropdown } from '@terraware/web-components';

import { CreateAccessionRequestPayloadV2Write } from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { getAllNurseries } from 'src/utils/organization';

import { useOrganization } from '../../providers/hooks';

interface NurseryDropdownProps<T extends CreateAccessionRequestPayloadV2Write> {
  record: T;
  label: string;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  isSelectionValid: (t: T) => boolean;
  disabled?: boolean;
  validate?: boolean;
}

export default function NurseryDropdown<T extends CreateAccessionRequestPayloadV2Write>(
  props: NurseryDropdownProps<T>
): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { label, setRecord, validate, record, isSelectionValid } = props;

  const onChangeHandler = (facilityId: string) => {
    setRecord((previousRecord: T): T => {
      return {
        ...previousRecord,
        facilityId,
      };
    });
  };

  return (
    <Dropdown
      id='facilityId'
      label={label}
      selectedValue={record.facilityId?.toString()}
      options={
        selectedOrganization
          ? getAllNurseries(selectedOrganization).map((nursery) => ({
              label: nursery.name,
              value: nursery.id.toString(),
            }))
          : []
      }
      onChange={onChangeHandler}
      errorText={validate && !isSelectionValid(record) ? strings.REQUIRED_FIELD : ''}
      fullWidth={true}
    />
  );
}
