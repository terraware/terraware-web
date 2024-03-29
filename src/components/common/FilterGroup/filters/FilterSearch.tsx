import React from 'react';

import { TextField, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import strings from 'src/strings';
import { FieldNodePayload } from 'src/types/Search';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    padding: theme.spacing(1.75),
  },
}));

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  onDelete: () => void;
  value: string | null;
  autoFocus: boolean;
}

export default function Search(props: Props): JSX.Element {
  const classes = useStyles();
  const [search, setSearch] = React.useState(props.value || '');

  React.useEffect(() => {
    setSearch(props.value || '');
  }, [props.value]);

  const onSearch = (searchVal: string) => {
    if (searchVal && searchVal !== '') {
      const values = [searchVal];

      const newFilter: FieldNodePayload = {
        field: props.field,
        values,
        type: 'Fuzzy',
        operation: 'field',
      };

      props.onChange(newFilter);
    } else {
      props.onDelete();
    }
  };

  return (
    <div className={classes.box}>
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
    </div>
  );
}
