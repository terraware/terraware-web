import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { FieldNodePayload } from 'src/types/Search';
import { Checkbox, theme } from '@terraware/web-components';
import { Box } from '@mui/material';

const useStyles = makeStyles(() => ({
  checkbox: {
    marginTop: 0,
    '& span[class*="-label"]': {
      fontWeight: 500,
    },
  },
}));

interface Props {
  field: string;
  label: string;
  value: boolean;
  onChange: (filter: FieldNodePayload) => void;
}

export default function FilterBoolean(props: Props): JSX.Element {
  const classes = useStyles();
  const [value, setValue] = useState(props.value);

  const onChange = (_value: boolean) => {
    setValue(_value);

    const newFilter: FieldNodePayload = {
      field: props.field,
      // This is necessary because the FieldNodePayload doesn't allow for boolean values, only string | null
      values: [`${_value}`],
      type: 'Exact',
      operation: 'field',
    };

    props.onChange(newFilter);
  };

  return (
    <Box sx={{ margin: theme.spacing(3) }}>
      <Checkbox
        label={props.label}
        onChange={onChange}
        id={props.field}
        name={props.field}
        value={value}
        className={classes.checkbox}
      />
    </Box>
  );
}
