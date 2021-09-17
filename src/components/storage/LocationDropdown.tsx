import { Grid } from '@material-ui/core';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { ConditionType, Location } from '../../api/types/locations';
import locationsSelector from '../../state/selectors/locations';
import strings from '../../strings';
import Dropdown from '../common/Dropdown';
import TextField from '../common/TextField';

interface Props {
  onChange: (id: string, value: unknown) => void;
  storageLocation?: string;
  storageCondition?: string;
}

export default function LocationDropdown({
  onChange,
  storageLocation,
  storageCondition,
}: Props): JSX.Element {
  const locations = useRecoilValue(locationsSelector);
  const resetLocations = useResetRecoilState(locationsSelector);

  React.useEffect(() => {
    return () => {
      resetLocations();
    };
  }, []);

  React.useEffect(() => {
    if (storageLocation) {
      onChange('storageCondition', getConditionValue(storageLocation) || '');
    }
  }, [storageLocation]);

  const generateLocationsValues = locations?.map((location: Location) => {
    return {
      label: location.storageLocation,
      value: location.storageLocation,
    };
  });

  const getConditionValue = (
    locationSelected: string
  ): ConditionType | undefined => {
    const location = locations?.find((location: Location) => {
      return location.storageLocation === locationSelected;
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
