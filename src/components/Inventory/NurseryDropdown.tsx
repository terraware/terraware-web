import React from 'react';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { Dropdown } from '@terraware/web-components';
import { getAllNurseries } from 'src/utils/organization';
import { useOrganization } from '../../providers/hooks';

interface NurseryDropdownProps<T extends AccessionPostRequestBody> {
  record: T;
  label: string;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  isSelectionValid: (t: T) => boolean;
  disabled?: boolean;
  validate?: boolean;
}

export default function NurseryDropdown<T extends AccessionPostRequestBody>(
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
      options={getAllNurseries(selectedOrganization).map((nursery) => ({
        label: nursery.name,
        value: nursery.id.toString(),
      }))}
      onChange={onChangeHandler}
      errorText={validate && !isSelectionValid(record) ? strings.REQUIRED_FIELD : ''}
      fullWidth={true}
    />
  );
}
