import {
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper
} from '@material-ui/core';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import snackbarAtom from '../../state/atoms/snackbar';
import { photoByFeatureIdSelector } from '../../state/selectors/photos';
import { plantsByFeatureIdSelector } from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesNamesBySpeciesIdSelector from '../../state/selectors/speciesNamesBySpeciesId';
import strings from '../../strings';
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

export default function Species(): JSX.Element {
  const classes = useStyles();

  const features = useRecoilValue(plantsPlantedFeaturesSelector);
  const plantsByFeature = useRecoilValue(plantsByFeatureIdSelector);
  const photoByFeature = useRecoilValue(photoByFeatureIdSelector);
  const speciesBySpeciesId = useRecoilValue(speciesNamesBySpeciesIdSelector);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const [editPlantOpen, setEditPlantOpen] = React.useState(false);
  const [selectedPlant, setSelectedPlant] = React.useState<PlantForTable>();
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
    React.useState(false);

  const plantsForTable = React.useMemo(() => {
    let plantsToReturn: PlantForTable[] = [];

    if (features && plantsByFeature && photoByFeature && speciesBySpeciesId) {
      plantsToReturn = features.reduce((_acum, feature) => {

        if (feature.id && plantsByFeature[feature.id]) {
          const plant = plantsByFeature[feature.id];
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
            plantToAdd.geolocation = `${feature.geom.coordinates[1].toFixed(6)}, ${feature.geom.coordinates[0].toFixed(6)}`;
          }
          _acum.push(plantToAdd);
        }

        return _acum;
      }, plantsToReturn);
    }

    return plantsToReturn;
  }, [features, photoByFeature, plantsByFeature, speciesBySpeciesId]);

  const onEditPlant = (row: TableRowType) => {
    setSelectedPlant(row as PlantForTable);
    setEditPlantOpen(true);
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
