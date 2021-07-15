import {
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
import React from 'react';

export interface Props {
  id: string;
  label: string;
  values?: DropdownItem[];
  onChange: (id: string, value: string) => void;
  selected: string | undefined;
  disabled?: boolean;
}
const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      width: '100%',
    },
  })
);

export type DropdownItem = {
  label: string;
  value: string;
};

export default function Dropdown({
  id,
  label,
  values,
  onChange,
  selected,
  disabled,
}: Props): JSX.Element {
  const onChangeH = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    _child: React.ReactNode
  ) => {
    onChange(id, event.target.value as string);
  };
  const classes = useStyles();

  return (
    <FormControl
      variant='outlined'
      className={classes.formControl}
      size='small'
      disabled={disabled}
    >
      <InputLabel id={`${id}-outlined-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-outlined-label`}
        id={id}
        label={label}
        onChange={onChangeH}
        value={selected}
      >
        {values?.map(({ label: inLabel, value }) => (
          <MenuItem id={value} key={value} value={value}>
            {inLabel}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
