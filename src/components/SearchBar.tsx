import { InputAdornment, TextField } from '@material-ui/core';
import { createStyles, fade, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValueLoadable } from 'recoil';
import searchSelector from '../state/selectors/searchByAccessionNumber';

const useStyles = makeStyles((theme) =>
  createStyles({
    search: {
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      width: 225,
    },
  })
);

export default function NavBar(): JSX.Element {
  const classes = useStyles();
  const [input, setInput] = React.useState('');
<<<<<<< HEAD
=======

  const loadableResults = useRecoilValueLoadable(
    searchSelector({
      searchInput: input,
      requestId: Math.trunc(Date.now() / 60000),
    })
  );
  const history = useHistory();

  const results =
    loadableResults.state === 'hasValue'
      ? loadableResults.contents.results
      : [];
>>>>>>> FE: Implement searchbar (#42)

  return (
    <div className={classes.search}>
      <Autocomplete
        id='search-bar'
        freeSolo
<<<<<<< HEAD
        options={[]}
        inputValue={input}
        onInputChange={(event, value) => {
          setInput(value);
        }}
        value=''
=======
        options={results.map((accession) => accession.accessionNumber)}
        inputValue={input}
        onInputChange={(event, value) => {
          setInput(value);
        }}
        value=''
        onChange={(event, value) => {
          if (value) {
            history.push(`/accessions/${value}/seed-collection`);
            setInput('');
          }
        }}
>>>>>>> FE: Implement searchbar (#42)
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder='Search'
            variant='outlined'
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size='small'
          />
        )}
      />
    </div>
  );
}
