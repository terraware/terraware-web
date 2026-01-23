import React, { type JSX } from 'react';

import { SelectT } from '@terraware/web-components';

import strings from 'src/strings';
import { Facility } from 'src/types/Facility';

type FacilitySelectorProps = {
  id?: string;
  label: string;
  selectedFacility?: Facility;
  facilities: Facility[];
  onChange: (value: Facility) => void;
  errorText?: string;
};

export default function FacilitySelector(props: FacilitySelectorProps): JSX.Element {
  const { id, label, selectedFacility, facilities, onChange, errorText } = props;

  return (
    <SelectT<Facility>
      id={id}
      label={label}
      placeholder={strings.SELECT}
      options={facilities}
      onChange={onChange}
      isEqual={(a: Facility, b: Facility) => a.id === b.id}
      renderOption={(facility) => facility.name}
      displayLabel={(facility) => facility?.name || ''}
      selectedValue={selectedFacility}
      toT={(name: string) =>
        ({
          name,
        }) as Facility
      }
      fullWidth={true}
      errorText={errorText}
      tooltipTitle={strings.TOOLTIP_ACCESSIONS_LOCATION}
    />
  );
}
