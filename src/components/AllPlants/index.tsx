import MomentUtils from '@date-io/moment';
import {
  Container,
  createStyles,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import TuneIcon from '@material-ui/icons/Tune';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import snackbarAtom from '../../state/atoms/snackbar';
import {speciesSelector} from '../../state/selectors/species';
import strings from '../../strings';
import Button from '../common/button/Button';
import DatePicker from '../common/DatePicker';
import Dropdown from '../common/Dropdown';
import Table from '../common/table';
import { TableRowType } from '../common/table/TableCellRenderer';
import { TableColumnType } from '../common/table/types';
import NewSpecieModal from '../Dashboard/NewSpecieModal';
import DeletePlantConfirmationModal from './DeletePlantConfirmationModal';
import AllPlantsCellRenderer from './TableCellRenderer';
import {SearchOptions} from '../../types/Plant';
import {
  plantsFilteredSelector,
  plantsPlantedFiltersAtom
} from '../../state/selectors/plants';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    mainContent: {
      paddingTop: theme.spacing(4),
    },
    filtersButton: {
      borderRadius: 0,
    },
    filtersIcon: {
      marginRight: theme.spacing(1),
    },
    buttonSpacing: {
      marginLeft: theme.spacing(1),
    },
  })
);

export type PlantForTable = {
  date?: string;
  species?: string;
  geolocation?: string;
  photo?: string;
  notes?: string;
  featureId?: number;
  speciesId?: number;
};

export default function AllPlants(): JSX.Element {
  const classes = useStyles();

  const speciesNames = useRecoilValue(speciesSelector);

  const [filters, setFilters] = useRecoilState(plantsPlantedFiltersAtom);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const [newFilters, setNewFilters] = React.useState<SearchOptions>();
  const [editPlantOpen, setEditPlantOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedPlant, setSelectedPlant] = React.useState<PlantForTable>();
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
    React.useState(false);

  React.useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setNewFilters({ ...filters });
      setShowFilters(true);
    }
  }, [filters]);

  const speciesNamesValues = speciesNames?.map((species) => ({
    label: species.name,
    value: species.name,
  }));

  const onEditPlant = (row: TableRowType) => {
    setSelectedPlant(row as PlantForTable);
    setEditPlantOpen(true);
  };

  const onFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const onApplyFilters = () => {
    if (newFilters) {
      setFilters(newFilters);
    }
  };

  const onClearFilters = () => {
    setNewFilters({});
    setFilters({});
  };

  const onChangeFilter = (id: string, value?: string) => {
    const newFiltersObj = { ...newFilters, [id]: value };
    setNewFilters(newFiltersObj);
  };

  const onCloseEditPlantModal = (snackbarMessage?: string) => {
    setEditPlantOpen(false);
    if (snackbarMessage) {
      setSnackbar({
        type: 'success',
        msg: snackbarMessage,
      });
    }
  };

  const onCloseDeleteConfirmationModal = (deleted?: boolean) => {
    setDeleteConfirmationModalOpen(false);
    if (deleted) {
      setSnackbar({
        type: 'delete',
        msg: strings.SNACKBAR_MSG_PLANT_DELETED,
      });
    }
  };

  const openDeleteConfirmationModal = () => {
    setDeleteConfirmationModalOpen(true);
  };

  return (
    <main>
      <NewSpecieModal
        open={editPlantOpen}
        onClose={onCloseEditPlantModal}
        onDelete={openDeleteConfirmationModal}
        value={selectedPlant}
      />
      {selectedPlant && (
        <DeletePlantConfirmationModal
          open={deleteConfirmationModalOpen}
          onClose={onCloseDeleteConfirmationModal}
          plant={selectedPlant}
        />
      )}
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <h1>{strings.ALL_PLANTS}</h1>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={11}>
            <IconButton
              id='show-filters'
              aria-label='filter'
              onClick={onFilterClick}
              className={classes.filtersButton}
            >
              <TuneIcon className={classes.filtersIcon} />
              <Typography variant='h6'>{strings.FILTERS}</Typography>
            </IconButton>
          </Grid>
          {showFilters && (
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Grid item xs={1} />
              <Grid item xs={2}>
                <DatePicker
                  label={strings.FROM}
                  id='min_entered_time'
                  aria-label='min_entered_time'
                  onChange={onChangeFilter}
                  value={newFilters?.minEnteredTime}
                />
              </Grid>
              <Grid item xs={2}>
                <DatePicker
                  id='max_entered_time'
                  label={strings.TO}
                  aria-label='max_entered_time'
                  onChange={onChangeFilter}
                  value={newFilters?.maxEnteredTime}
                />
              </Grid>
              <Grid item xs={2}>
                <Dropdown
                  id='species_name'
                  label={strings.SPECIES}
                  onChange={onChangeFilter}
                  selected={newFilters?.speciesName ?? ''}
                  values={speciesNamesValues}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id='notes'
                  placeholder={strings.NOTES}
                  variant='outlined'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon onClick={onApplyFilters} />
                      </InputAdornment>
                    ),
                  }}
                  value={newFilters?.notes ?? ''}
                  size='small'
                  onChange={(event) => {
                    onChangeFilter('notes', event.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  id='apply-filters'
                  label={strings.APPLY_FILTERS}
                  onClick={onApplyFilters}
                  type='passive'
                  priority='secondary'
                />
                <Button
                  id='clear-filters'
                  label={strings.CLEAR_FILTERS}
                  onClick={onClearFilters}
                  type='passive'
                  priority='secondary'
                  className={classes.buttonSpacing}
                />
              </Grid>
              <Grid item xs={1} />
            </MuiPickersUtilsProvider>
          )}
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
              <React.Suspense fallback={strings.LOADING}>
                <AllPlantsContent onEditPlant={onEditPlant} />
              </React.Suspense>
            </Paper>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}

interface AllPlantsProps {
  onEditPlant: (row: TableRowType) => void;
}

function AllPlantsContent({ onEditPlant }: AllPlantsProps): JSX.Element {
  const species = useRecoilValue(speciesSelector);
  const plantsFiltered = useRecoilValue(plantsFilteredSelector);

  const plantsForTable = React.useMemo(() => {
    let plantsToReturn: PlantForTable[] = [];

    if (plantsFiltered && species) {
      plantsToReturn = plantsFiltered.map((plant) => {
        const plantToAdd: PlantForTable = {
          date: plant.enteredTime,
          species: species.find((item) => item.id === plant.speciesId)?.name,
          notes: plant.notes,
          featureId: plant.featureId,
          speciesId: plant.speciesId,
        };
        if (plant.coordinates) {
          plantToAdd.geolocation = `${plant.coordinates.latitude.toFixed(6)},
                                    ${plant.coordinates.longitude.toFixed(6)}`;
        }

        return plantToAdd;
      });
    }

    return plantsToReturn;
  }, [plantsFiltered, species]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Table
          id='all-plants-table'
          columns={columns}
          rows={plantsForTable}
          orderBy='species'
          Renderer={AllPlantsCellRenderer}
          onSelect={onEditPlant}
        />
      </Grid>
    </Grid>
  );
}

const columns: TableColumnType[] = [
  { key: 'date', name: strings.DATE, type: 'date' },
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'geolocation', name: strings.GEOLOCATION, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];
