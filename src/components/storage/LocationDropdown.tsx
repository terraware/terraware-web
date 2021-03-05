import { Grid } from '@material-ui/core';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { Accession } from '../../api/types/accessions';
import { ConditionType, Location } from '../../api/types/locations';
import locationsSelector from '../../state/selectors/locations';
import useForm from '../../utils/useForm';
import Dropdown from '../common/Dropdown';
import TextField from '../common/TextField';

interface Props {
  accession: Accession;
}

export default function LocationDropdown({ accession }: Props): JSX.Element {
  const locations = useRecoilValue(locationsSelector);
  const resetLocations = useResetRecoilState(locationsSelector);

  React.useEffect(() => {
    return () => {
      resetLocations();
    };
  }, []);

  const [record, setRecord, onChange] = useForm(accession);
  React.useEffect(() => {
    setRecord(accession);
  }, [accession]);

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
    setRecord({
      ...record,
      [id]: value,
      storageCondition: getConditionValue(value),
    });
  };

  return (
    <>
      <Grid item xs={4}>
        <Dropdown
          id='storageLocation'
          label='Location'
          selected={record.storageLocation || ''}
          values={generateLocationsValues}
          onChange={onStorageLocationChange}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          id='storageCondition'
          value={record.storageCondition}
          onChange={onChange}
          label='Condition'
          disabled={true}
        />
      </Grid>
    </>
  );
}
