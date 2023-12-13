import { MultiSelect } from '@terraware/web-components';
import strings from '../../../strings';
import { SubLocation } from '../../../types/Facility';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

type SubLocationsDropdownProps<T extends { subLocationIds?: number[] } | undefined> = {
  availableSubLocations: SubLocation[] | undefined;
  record: T;
  setRecord: (setFn: (previousValue: T) => T) => void;
  minimal?: boolean;
};

const useStyles = makeStyles((theme: Theme) => ({
  multiSelectStyle: {
    height: '100%',
    width: '100%',
  },
}));

function SubLocationsDropdown<T extends { subLocationIds?: number[] } | undefined>({
  availableSubLocations,
  record,
  setRecord,
  minimal,
}: SubLocationsDropdownProps<T>) {
  const classes = useStyles();

  return (
    <MultiSelect<number, string>
      className={classes.multiSelectStyle}
      fullWidth={true}
      label={!minimal ? strings.SUB_LOCATIONS : undefined}
      onAdd={(subLocationId: number) => {
        setRecord((previousValue) => ({
          ...previousValue,
          subLocationIds: [...(previousValue?.subLocationIds || []), Number(subLocationId)],
        }));
      }}
      onRemove={(subLocationId: number) => {
        setRecord((previousValue) => ({
          ...previousValue,
          subLocationIds: previousValue?.subLocationIds?.filter((id: number) => id !== subLocationId) || [],
        }));
      }}
      options={new Map(availableSubLocations?.map((subLocation) => [subLocation.id, subLocation.name]))}
      valueRenderer={(val: string) => val}
      selectedOptions={record?.subLocationIds || []}
      placeHolder={strings.SELECT}
    />
  );
}

export default SubLocationsDropdown;
