import React, { type JSX, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { Checkbox, theme } from '@terraware/web-components';

import { FieldNodePayload } from 'src/types/Search';

interface Props {
  field: string;
  label: string;
  value: boolean;
  onChange: (filter: FieldNodePayload) => void;
}

export default function FilterBoolean(props: Props): JSX.Element {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

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
        sx={{
          marginTop: 0,
          '& span[class*="-label"]': {
            fontWeight: 500,
          },
        }}
      />
    </Box>
  );
}
