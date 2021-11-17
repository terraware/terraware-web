import { InputAdornment, TextField } from '@material-ui/core';
import { createStyles, alpha, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValueLoadable, useResetRecoilState } from 'recoil';
import searchSelector from 'src/state/selectors/seeds/searchByAccessionNumber';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const useStyles = makeStyles((theme) =>
  createStyles({
    search: {
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      width: 225,
    },
  })
);

export default function NavBar(): JSX.Element {
  const classes = useStyles();
  const [input, setInput] = React.useState('');

  const loadableResults = useRecoilValueLoadable(searchSelector(input));
  const resetResults = useResetRecoilState(searchSelector(input));
  const history = useHistory();

  const results = loadableResults.state === 'hasValue' ? loadableResults.contents.results : [];

  const location = useStateLocation();

  return (
    <div className={classes.search}>
      <Autocomplete
        id='search-bar'
        freeSolo
        options={results.map((accession) => accession.accessionNumber)}
        inputValue={input}
        onInputChange={(event, value) => {
          setInput(value);
        }}
        value=''
        onChange={(event, value) => {
          const accession = results.find((result) => result.accessionNumber === value);
          if (accession) {
            history.push(getLocation(`/accessions/${accession.id}`, location));
            resetResults();
            setInput('');
          }
        }}
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
