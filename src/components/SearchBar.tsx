import { InputAdornment, TextField } from '@material-ui/core';
import { createStyles, alpha, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getAccessionsByNumber, SearchResponseElement } from 'src/api/seeds/search';
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

export type NavBarProps = {
  facilityId: number;
};

export default function NavBar(props: NavBarProps): JSX.Element {
  const classes = useStyles();
  const { facilityId } = props;
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponseElement[]>([]);
  const history = useHistory();
  const location = useStateLocation();

  useEffect(() => {
    const populateSearchResults = async () => {
      if (Number(searchInput)) {
        const apiResponse = await getAccessionsByNumber(parseInt(searchInput, 10), facilityId);
        if (apiResponse !== null) {
          setSearchResults(apiResponse);
          return;
        }
      }
      setSearchResults([]);
    };

    populateSearchResults();
  }, [facilityId, searchInput]);

  return (
    <div className={classes.search}>
      <Autocomplete
        id='search-bar'
        freeSolo
        options={searchResults.map((accession) => accession.accessionNumber)}
        inputValue={searchInput}
        onInputChange={(event, value) => {
          setSearchInput(value);
        }}
        value=''
        onChange={(event, value) => {
          const accession = searchResults.find((result) => result.accessionNumber === value);
          if (accession) {
            history.push(getLocation(`/accessions/${accession.id}`, location));
            setSearchResults([]);
            setSearchInput('');
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
