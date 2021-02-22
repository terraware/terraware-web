import {
  createStyles,
  InputAdornment,
  makeStyles,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import { SearchField, SearchFilter } from '../../api/types/search';

const useStyles = makeStyles((theme) =>
  createStyles({
    box: {
      padding: theme.spacing(1.75),
    },
  })
);

interface Props {
  field: SearchField;
  onChange: (filter: SearchFilter) => void;
  values: (string | null)[];
}

export default function Search(props: Props): JSX.Element {
  const classes = useStyles();
  const onSearchClick = () => {
    const values = [search];

    const newFilter: SearchFilter = {
      field: props.field,
      values: values,
      type: 'Fuzzy',
    };

    props.onChange(newFilter);
  };

  const onEnter = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      onSearchClick();
    }
  };

  const [search, setSearch] = React.useState(props.values[0] || '');

  return (
    <div id={'search' + props.field} className={classes.box}>
      <TextField
        placeholder='Search'
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
