import { TextField } from '@material-ui/core';
import { Autocomplete as MUIAutocomplete } from '@material-ui/lab';
import React, { ChangeEvent } from 'react';

export interface Props {
  id: string;
  label: string;
  values: string[];
  onChange: (id: string, value: string) => void;
  selected: string | undefined;
}

export type DropdownItem = {
  label: string;
  value: string;
};

export default function Autocomplete({
  id,
  label,
  values,
  onChange,
  selected,
}: Props): JSX.Element {
  const onChangeHandler = (event: ChangeEvent<any>, value: string | null) => {
    if (event) {
      if (value) {
        onChange(id, value);
      } else {
        onChange(id, '');
      }
    }
  };

  return (
    <MUIAutocomplete
      id={id}
      options={values}
      getOptionLabel={(option) => (option ? option : '')}
      onChange={onChangeHandler}
      onInputChange={onChangeHandler}
      inputValue={selected}
      freeSolo={true}
      forcePopupIcon={true}
      renderInput={(params) => (
        <TextField {...params} label={label} variant='outlined' size='small' />
      )}
    />
  );
}
