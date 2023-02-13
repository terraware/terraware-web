import { TextField, Theme } from '@mui/material';
import React from 'react';
import strings from 'src/strings';
import { FieldNodePayload } from 'src/api/search';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    padding: theme.spacing(1.75),
  },
}));

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  onDelete: () => void;
  values: (string | null)[];
  autoFocus: boolean;
}

export default function Search(props: Props): JSX.Element {
  const classes = useStyles();
  const [search, setSearch] = React.useState(props.values[0] || '');

  React.useEffect(() => {
    setSearch(props.values[0] || '');
  }, [props.values]);

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
