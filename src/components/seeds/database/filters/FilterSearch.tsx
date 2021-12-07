import { createStyles, InputAdornment, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import strings from 'src/strings';
import {FieldNodePayload, SearchField} from '../../../../api/seeds/search';

const useStyles = makeStyles((theme) =>
  createStyles({
    box: {
      padding: theme.spacing(1.75),
    },
  })
);

interface Props {
  field: SearchField;
  onChange: (filter: FieldNodePayload) => void;
  values: (string | null)[];
}

export default function Search(props: Props): JSX.Element {
  const classes = useStyles();
  const [search, setSearch] = React.useState(props.values[0] || '');

  React.useEffect(() => {
    setSearch(props.values[0] || '');
  }, [props.values]);

  const onSearchClick = () => {
    const values = [search];

    const newFilter: FieldNodePayload = {
      field: props.field,
      values,
      type: 'Fuzzy',
      operation: 'field',
    };

    props.onChange(newFilter);
  };

  const onEnter = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      onSearchClick();
    }
  };

  return (
    <div className={classes.box}>
      <TextField
        id={props.field ?? ''}
        placeholder={strings.SEARCH}
        variant='outlined'
        value={search}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon onClick={onSearchClick} />
            </InputAdornment>
          ),
        }}
        size='small'
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        onKeyPress={(e) => onEnter(e)}
      />
    </div>
  );
}
