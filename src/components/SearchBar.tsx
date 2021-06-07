import { InputAdornment, TextField } from "@material-ui/core";
import { createStyles, fade, makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React from "react";

const useStyles = makeStyles((theme) =>
  createStyles({
    search: {
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      width: 225,
    },
  })
);

export default function NavBar(): JSX.Element {
  const classes = useStyles();
  const [input, setInput] = React.useState("");

  return (
    <div className={classes.search}>
      <Autocomplete
        id="search-bar"
        freeSolo
        options={[]}
        inputValue={input}
        onInputChange={(event, value) => {
          setInput(value);
        }}
        value=""
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        )}
      />
    </div>
  );
}
