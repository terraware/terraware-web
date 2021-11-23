/* eslint-disable react-hooks/exhaustive-deps */
import { Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getLocations } from 'src/api/seeds/locations';
import { ConditionType, StorageLocation } from 'src/api/types/locations';
import Dropdown from 'src/components/common/Dropdown';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';

interface LocationDropdownProps {
  facilityId: number;
  onChange: (id: string, value: unknown) => void;
  storageLocation?: string;
  storageCondition?: string;
}

export default function LocationDropdown(props: LocationDropdownProps): JSX.Element {
  const { facilityId, onChange, storageLocation, storageCondition } = props;
  const [locations, setLocations] = useState<StorageLocation[]>([]);

  useEffect(() => {
    const populateLocations = async () => {
      setLocations(await getLocations(facilityId));
    };
    populateLocations()
  }, [facilityId]);

  useEffect(() => {
    if (storageLocation) {
      onChange('storageCondition', getConditionValue(storageLocation) || '');
    }
  }, [storageLocation]);

  const generateLocationsValues = locations?.map((location: StorageLocation) => {
    return {
      label: location.storageLocation,
      value: location.storageLocation,
    };
  });

  const getConditionValue = (locationSelected: string): ConditionType | undefined => {
    const location = locations?.find((_location: StorageLocation) => {
      return _location.storageLocation === locationSelected;
    });

    return location?.storageCondition;
  };

  const onStorageLocationChange = (id: string, value: string) => {
    onChange(id, value);
  };

  return (
    <>
      <Grid item xs={4}>
        <Dropdown
          id='storageLocation'
          label={strings.LOCATION}
          selected={storageLocation}
          values={generateLocationsValues}
          onChange={onStorageLocationChange}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          id='storageCondition'
          value={storageCondition}
          onChange={onChange}
          label={strings.CONDITION}
          disabled={true}
        />
      </Grid>
    </>
  );
}
