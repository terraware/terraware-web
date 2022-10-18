import React, { useState } from 'react';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { SelectT } from '@terraware/web-components';
import { Facility } from 'src/api/types/facilities';
import { getAllNurseries } from 'src/utils/organization';

interface NurseryDropdownProps<T extends AccessionPostRequestBody> {
  organization: ServerOrganization;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
  validate?: boolean;
}

export default function NurseryDropdown<T extends AccessionPostRequestBody>(
  props: NurseryDropdownProps<T>
): JSX.Element {
  const { organization, setRecord, validate, record } = props;
  const [selectedValue, setSelectedValue] = useState<Facility>();

  const onChangeHandler = (value: Facility) => {
    setSelectedValue(value);
    if (value?.id) {
      setRecord((previousRecord: T): T => {
        return {
          ...previousRecord,
          facilityId: value.id,
        };
      });
    }
  };

  const toT = (option: string) => {
    return { name: option } as Facility;
  };

  const getNurseries = () => {
    const nurseries: Facility[] = [];
    getAllNurseries(organization).forEach((nursery) => {
      if (nursery !== undefined) {
        nurseries.push(nursery);
      }
    });
    return nurseries;
  };

  return (
    <SelectT<Facility>
      label={strings.RECEIVING_NURSERY_REQUIRED}
      placeholder={strings.SELECT}
      options={getNurseries()}
      onChange={onChangeHandler}
      isEqual={(a: Facility, b: Facility) => a.id === b.id}
      renderOption={(facility) => facility.name}
      displayLabel={(facility) => facility?.name || ''}
      selectedValue={selectedValue}
      toT={toT}
      fullWidth={true}
      readonly={false}
      errorText={validate && !record.facilityId ? strings.REQUIRED_FIELD : ''}
    />
  );
}
