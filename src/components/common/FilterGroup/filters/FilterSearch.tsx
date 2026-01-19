import React, { type JSX } from 'react';

import { Box, TextField, useTheme } from '@mui/material';

import strings from 'src/strings';
import { FieldNodePayload } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  onDelete: () => void;
  value: string | null;
  autoFocus: boolean;
}

export default function Search(props: Props): JSX.Element {
  const theme = useTheme();
  const [search, setSearch] = React.useState(props.value || '');

  React.useEffect(() => {
    setSearch(props.value || '');
  }, [props.value]);

  const onSearch = (searchVal: string) => {
    if (searchVal && searchVal !== '') {
      const { type, values } = parseSearchTerm(searchVal);

      const newFilter: FieldNodePayload = {
        field: props.field,
        operation: 'field',
        type,
        values,
      };

      props.onChange(newFilter);
    } else {
      props.onDelete();
    }
  };

  return (
    <Box sx={{ padding: theme.spacing(1.75) }}>
      <TextField
        id={props.field ?? ''}
        fullWidth={true}
        placeholder={strings.SEARCH}
        variant='outlined'
        value={search}
        autoFocus={props.autoFocus}
        size='small'
        onChange={(event) => {
          onSearch(event.target.value);
        }}
      />
    </Box>
  );
}
