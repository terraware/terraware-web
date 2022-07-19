import { Autocomplete as MUIAutocomplete, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react';

export interface Props {
  id: string;
  label: string;
  values: string[];
  onChange: (id: string, value: string) => void;
  selected: string | undefined;
  disabled?: boolean;
  freeSolo: boolean;
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
  disabled,
  freeSolo,
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
      disabled={disabled}
      id={id}
      options={values}
      getOptionLabel={(option) => (option ? option : '')}
      onChange={onChangeHandler}
      onInputChange={onChangeHandler}
      inputValue={selected}
      freeSolo={freeSolo}
      forcePopupIcon={true}
      renderInput={(params) => <TextField {...params} label={label} variant='outlined' size='small' />}
    />
  );
}
