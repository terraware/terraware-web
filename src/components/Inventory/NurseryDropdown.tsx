import React from 'react';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Dropdown } from '@terraware/web-components';
import { getAllNurseries } from 'src/utils/organization';

interface NurseryDropdownProps<T extends AccessionPostRequestBody> {
  organization: ServerOrganization;
  record: T;
  label: string;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
  validate?: boolean;
}

export default function NurseryDropdown<T extends AccessionPostRequestBody>(
  props: NurseryDropdownProps<T>
): JSX.Element {
  const { organization, label, setRecord, validate, record } = props;

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
      options={getAllNurseries(organization).map((nursery) => ({ label: nursery.name, value: nursery.id.toString() }))}
      onChange={onChangeHandler}
      errorText={validate && !record.facilityId ? strings.REQUIRED_FIELD : ''}
      fullWidth={true}
    />
  );
}
