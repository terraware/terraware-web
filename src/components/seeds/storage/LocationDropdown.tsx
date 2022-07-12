/* eslint-disable react-hooks/exhaustive-deps */
import { Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { ConditionType, getLocations, StorageLocation } from 'src/api/seeds/locations';
import Dropdown from 'src/components/common/Dropdown';
import strings from 'src/strings';

interface LocationDropdownProps {
  facilityId: number;
  onChange: (id: string, value: unknown) => void;
  storageLocation?: string;
}

export default function LocationDropdown(props: LocationDropdownProps): JSX.Element {
  const { facilityId, onChange, storageLocation } = props;
  const [locations, setLocations] = useState<StorageLocation[]>([]);

  useEffect(() => {
    const populateLocations = async () => {
      const apiResponse = await getLocations(facilityId);
      // TODO what if the request fails?
      if (apiResponse !== null) {
        setLocations(apiResponse);
      }
    };
    populateLocations();
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
    </>
  );
}
