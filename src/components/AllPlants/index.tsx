import MomentUtils from '@date-io/moment';
import {
  Chip,
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
import { useRecoilValue, useSetRecoilState } from 'recoil';
import snackbarAtom from '../../state/atoms/snackbar';
import { photoByFeatureIdSelector } from '../../state/selectors/photos';
import {
  plantsByFeatureIdFilteredSelector,
  plantsPlantedFiltersAtom,
} from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesNamesSelector from '../../state/selectors/speciesNames';
import speciesNamesBySpeciesIdSelector from '../../state/selectors/speciesNamesBySpeciesId';
import strings from '../../strings';
import DatePicker from '../common/DatePicker';
import Dropdown from '../common/Dropdown';
import Table from '../common/table';
import { TableRowType } from '../common/table/TableCellRenderer';
import { TableColumnType } from '../common/table/types';
import NewSpecieModal from '../Dashboard/NewSpecieModal';
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
    applyFilters: {
      border: `2px solid ${theme.palette.gray[800]}`,
      background: 'none',
      color: theme.palette.gray[800],
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

export type SearchOptions = {
  species_name?: string;
  min_entered_time?: string;
  max_entered_time?: string;
  notes?: string;
};

export default function Species(): JSX.Element {
  const classes = useStyles();

  const features = useRecoilValue(plantsPlantedFeaturesSelector);

  const setFilters = useSetRecoilState(plantsPlantedFiltersAtom);

  const [newFilters, setNewFilters] = React.useState<SearchOptions>();

  const photoByFeature = useRecoilValue(photoByFeatureIdSelector);
  const speciesBySpeciesId = useRecoilValue(speciesNamesBySpeciesIdSelector);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const speciesNames = useRecoilValue(speciesNamesSelector);

  const [editPlantOpen, setEditPlantOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [, setSearch] = React.useState('');
  const [selectedPlant, setSelectedPlant] = React.useState<PlantForTable>();
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
    React.useState(false);

  const speciesNamesValues = speciesNames?.map((species) => ({
    label: species.name,
    value: species.name,
  }));

  const plantsByFeatureFiltered = useRecoilValue(
    plantsByFeatureIdFilteredSelector
  );

  const plantsForTable = React.useMemo(() => {
    let plantsToReturn: PlantForTable[] = [];

    if (
      features &&
      plantsByFeatureFiltered &&
      photoByFeature &&
      speciesBySpeciesId
    ) {
      plantsToReturn = features.reduce((_acum, feature) => {
        if (feature.id && plantsByFeatureFiltered[feature.id]) {
          const plant = plantsByFeatureFiltered[feature.id];
          const plantToAdd: PlantForTable = {
            date: plant.date_planted,
            species: plant.species_id
              ? speciesBySpeciesId[plant.species_id].name
              : undefined,
            photo: photoByFeature[feature.id],
            notes: feature.notes,
            featureId: feature.id,
            speciesId: plant.species_id,
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
  }, [features, photoByFeature, plantsByFeatureFiltered, speciesBySpeciesId]);

  const onEditPlant = (row: TableRowType) => {
    setSelectedPlant(row as PlantForTable);
    setEditPlantOpen(true);
  };

  const onFilterClick = () => {
    setShowFilters(!showFilters);
  };

  // tslint:disable-next-line: no-empty
  const onSearch = () => {};

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
          <Grid item xs={2}>
            <h1>{strings.ALL_PLANTS}</h1>
          </Grid>
          <Grid item xs={9} />
          <Grid item xs={1} />
          <Grid item xs={11}>
            <IconButton
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
                  aria-label='date-from'
                  onChange={onChangeFilter}
                />
              </Grid>
              <Grid item xs={2}>
                <DatePicker
                  label={strings.TO}
                  aria-label='max_entered_time'
                  onChange={onChangeFilter}
                />
              </Grid>
              <Grid item xs={2}>
                <Dropdown
                  id='species_name'
                  label={strings.SPECIES}
                  onChange={onChangeFilter}
                  selected={newFilters?.species_name ?? ''}
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
                        <SearchIcon onClick={onSearch} />
                      </InputAdornment>
                    ),
                  }}
                  size='small'
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={1}>
                <Chip
                  id='apply-filters'
                  size='medium'
                  label={strings.APPLY_FILTERS}
                  onClick={onApplyFilters}
                  className={classes.applyFilters}
                />
              </Grid>
              <Grid item xs={1}>
                <Chip
                  id='apply-filters'
                  size='medium'
                  label={strings.CLEAR_FILTERS}
                  onClick={onClearFilters}
                  className={classes.applyFilters}
                />
              </Grid>
              <Grid item xs={1} />
            </MuiPickersUtilsProvider>
          )}
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
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
            </Paper>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}

const columns: TableColumnType[] = [
  { key: 'date', name: strings.DATE, type: 'date' },
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'geolocation', name: strings.GEOLOCATION, type: 'string' },
  { key: 'photo', name: strings.PHOTO, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];
