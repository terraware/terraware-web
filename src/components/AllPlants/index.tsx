import {
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper,
} from '@material-ui/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { photoByFeatureIdSelector } from '../../state/selectors/photos';
import { plantsByFeatureIdSelector } from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesNamesBySpeciesId from '../../state/selectors/speciesNamesBySpeciesId';
import strings from '../../strings';
import Table from '../common/table';
import { TableColumnType } from '../common/table/types';
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

type PlantForTable = {
  date?: string;
  species?: string;
  geolocation?: string;
  photo?: string;
  notes?: string;
};

export default function Species(): JSX.Element {
  const classes = useStyles();

  const features = useRecoilValue(plantsPlantedFeaturesSelector);
  const plantsByFeature = useRecoilValue(plantsByFeatureIdSelector);
  const photoByFeature = useRecoilValue(photoByFeatureIdSelector);
  const speciesBySpeciesId = useRecoilValue(speciesNamesBySpeciesId);

  const plantsForTable = React.useMemo(() => {
    let plantsToReturn: PlantForTable[] = [];
    if (features && plantsByFeature && photoByFeature && speciesBySpeciesId) {
      plantsToReturn = features.map((feature) => {
        if (
          feature.id &&
          feature.geom &&
          Array.isArray(feature.geom.coordinates)
        ) {
          const plant = plantsByFeature[feature.id];
          if (plant.species_id) {
            const species = speciesBySpeciesId[plant.species_id];

            return {
              date: plant.date_planted,
              species: species.name,
              geolocation: `${feature.geom.coordinates[1].toFixed(
                6
              )}, ${feature.geom.coordinates[0].toFixed(6)}`,
              photo: photoByFeature[feature.id],
              notes: feature.notes,
            };
          }
        }

        return {};
      });
    }

    return plantsToReturn;
  }, [features, photoByFeature, plantsByFeature, speciesBySpeciesId]);

  return (
    <main>
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
