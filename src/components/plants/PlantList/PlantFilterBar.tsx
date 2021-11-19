import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { createStyles, Grid, InputAdornment, makeStyles } from '@material-ui/core';
import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';
import Dropdown from 'src/components/common/Dropdown';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Button from 'src/components/common/button/Button';
import React, { useState } from 'react';
import { PlantSearchOptions } from 'src/types/Plant';

const useStyles = makeStyles((theme) =>
  createStyles({
    buttonSpacing: {
      marginLeft: theme.spacing(1),
    },
  })
);

const EMPTY_FILTERS: PlantSearchOptions = {
  speciesName: undefined,
  minEnteredTime: undefined,
  maxEnteredTime: undefined,
  notes: undefined,
};

type PlantFilterBarProps = {
  speciesNames: string[];
  filters?: PlantSearchOptions;
  onApplyFilters: (filters: PlantSearchOptions) => void;
  onClearFilters: () => void;
};

export default function PlantFilterBar(props: PlantFilterBarProps): JSX.Element {
  const classes = useStyles();
  const { speciesNames, filters, onApplyFilters, onClearFilters } = props;
  const [unsavedFilters, setUnsavedFilters] = useState<PlantSearchOptions>(filters ? filters : EMPTY_FILTERS);

  const onChange = (id: string, value?: string) => {
    const newFiltersObj = { ...unsavedFilters, [id]: value };
    setUnsavedFilters(newFiltersObj);
  };

  const onClear = () => {
    setUnsavedFilters(EMPTY_FILTERS);
    onClearFilters();
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Grid item xs={1} />
      <Grid item xs={2}>
        <DatePicker
          label={strings.FROM}
          id='minEnteredTime'
          aria-label='min_entered_time'
          onChange={onChange}
          value={unsavedFilters.minEnteredTime}
        />
      </Grid>
      <Grid item xs={2}>
        <DatePicker
          id='maxEnteredTime'
          label={strings.TO}
          aria-label='max_entered_time'
          onChange={onChange}
          value={unsavedFilters?.maxEnteredTime}
        />
      </Grid>
      <Grid item xs={2}>
        <Dropdown
          id='speciesName'
          label={strings.SPECIES}
          onChange={onChange}
          selected={unsavedFilters.speciesName ?? ''}
          values={speciesNames.map((name) => ({ label: name, value: name }))}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          id='notes'
          role='searchbox'
          aria-label={strings.NOTES}
          placeholder={strings.NOTES}
          variant='outlined'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          value={unsavedFilters.notes ?? ''}
          size='small'
          onChange={(event) => {
            onChange('notes', event.target.value);
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          id='apply-filters'
          label={strings.APPLY_FILTERS}
          onClick={() => onApplyFilters(unsavedFilters)}
          type='passive'
          priority='secondary'
        />
        <Button
          id='clear-filters'
          label={strings.CLEAR_FILTERS}
          onClick={onClear}
          type='passive'
          priority='secondary'
          className={classes.buttonSpacing}
        />
      </Grid>
      <Grid item xs={1} />
    </MuiPickersUtilsProvider>
  );
}
