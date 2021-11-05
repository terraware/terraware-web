import MomentUtils from '@date-io/moment';
import {
  Container,
  createStyles,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  TablePagination,
  Typography,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import TuneIcon from '@material-ui/icons/Tune';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { PlantsListQuery } from 'src/api/types/plant';
import snackbarAtom from 'src/state/atoms/snackbar';
import { plantsPlantedFeaturesPaginatedSelector } from 'src/state/selectors/plants/plantsFeatures';
import {
  plantsByFeatureIdFilteredSelector,
  plantsFiltersAtom
} from 'src/state/selectors/plants/plantsFiltered';
import speciesSelector from 'src/state/selectors/species';
import speciesNamesBySpeciesIdSelector from 'src/state/selectors/speciesById';
import strings from 'src/strings';
import Button from '../../common/button/Button';
import DatePicker from '../../common/DatePicker';
import Dropdown from '../../common/Dropdown';
import Table from '../../common/table';
import { TableRowType } from '../../common/table/TableCellRenderer';
import { TableColumnType } from '../../common/table/types';
import NewSpeciesModal from '../EditPlantModal';
import DeletePlantConfirmationModal from './DeletePlantConfirmationModal';
import AllPlantsCellRenderer from './TableCellRenderer';

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

export default function PlantsList(): JSX.Element {
  const classes = useStyles();

  const species = useRecoilValue(speciesSelector);

  const [filters, setFilters] = useRecoilState(plantsFiltersAtom);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const [newFilters, setNewFilters] = React.useState<PlantsListQuery>();
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

  const speciesNamesValues = species?.map((sp) => ({
    label: sp.name,
    value: sp.name,
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
      <NewSpeciesModal
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
            <h1>{strings.PLANTS}</h1>
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
                  id='minEnteredTime'
                  aria-label='min_entered_time'
                  onChange={onChangeFilter}
                  value={newFilters?.minEnteredTime}
                />
              </Grid>
              <Grid item xs={2}>
                <DatePicker
                  id='maxEnteredTime'
                  label={strings.TO}
                  aria-label='max_entered_time'
                  onChange={onChangeFilter}
                  value={newFilters?.maxEnteredTime}
                />
              </Grid>
              <Grid item xs={2}>
                <Dropdown
                  id='speciesName'
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
  const [limit, setLimit] = React.useState(100);
  const [skip, setSkip] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const featuresList = useRecoilValue(
    plantsPlantedFeaturesPaginatedSelector({ limit, skip })
  );
  const features = featuresList?.features;
  const totalResults = featuresList?.totalCount;
  const speciesBySpeciesId = useRecoilValue(speciesNamesBySpeciesIdSelector);
  const plantsByFeatureFiltered = useRecoilValue(
    plantsByFeatureIdFilteredSelector
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    if (newPage > page) {
      setSkip(skip + limit);
    } else {
      setSkip(skip - limit);
    }
    setPage(newPage);
  };

  const plantsForTable = React.useMemo(() => {
    let plantsToReturn: PlantForTable[] = [];

    if (features && plantsByFeatureFiltered && speciesBySpeciesId) {
      plantsToReturn = features.reduce((_acum, feature) => {
        if (feature.id && plantsByFeatureFiltered[feature.id]) {
          const plant = plantsByFeatureFiltered[feature.id];
          const plantToAdd: PlantForTable = {
            date: feature.enteredTime,
            species: plant.speciesId
              ? speciesBySpeciesId[plant.speciesId].name
              : undefined,
            notes: feature.notes,
            featureId: feature.id,
            speciesId: plant.speciesId,
          };

          if (feature.geom && Array.isArray(feature.geom.coordinates)) {
            plantToAdd.geolocation = `${feature.geom.coordinates[1].toFixed(
              6
            )}, ${feature.geom.coordinates[0].toFixed(6)}`;
          }
          _acum.push(plantToAdd);
        }

        return _acum;
      }, plantsToReturn);
    }

    return plantsToReturn;
  }, [features, plantsByFeatureFiltered, speciesBySpeciesId]);

  const changeRowsPerPageHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
    setSkip(0);
  };

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
        {/* @ts-ignore */}
        <TablePagination
          component='div'
          count={totalResults || 0}
          page={page}
          onChangePage={handleChangePage}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onChangeRowsPerPage={changeRowsPerPageHandler}
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
