import { Container, createStyles, Grid, IconButton, makeStyles, Paper, Typography } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import React, { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/atoms/snackbar';
import strings from 'src/strings';
import EditPlantModal from '../EditPlantModal';
import PlantFilterBar from './PlantFilterBar';
import PlantListContent from './PlantListContent';
import { getAllSpecies } from 'src/api/species/species';
import { getPlantsForMultipleLayers } from 'src/api/plants/plants';
import { getPlantPhoto } from 'src/api/plants/photo';
import { Plant, PlantSearchOptions } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';
import { Project, ServerOrganization, Site } from 'src/types/Organization';
import Title from 'src/components/common/Title';
import { getPlantLayers } from 'src/api/organization/organization';
import { getSelectedSites } from 'src/utils/organization';

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

type PlantListProps = {
  organization?: ServerOrganization;
  filters?: PlantSearchOptions;
  setFilters: (filters?: PlantSearchOptions) => void;
};

export default function PlantList(props: PlantListProps): JSX.Element {
  const classes = useStyles();
  const { organization, filters, setFilters } = props;
  const [speciesById, setSpeciesById] = useState<SpeciesById>(new Map());
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant>();
  const [selectedPlantPhoto, setSelectedPlantPhoto] = useState<string>();
  const [showFilters, setShowFilters] = useState(filters ? true : false);
  const [selectedSite, setSelectedSite] = useState<Site>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const fetchPlantsAndSpecies = useCallback(() => {
    const populateSpecies = async () => {
      const speciesResponse = await getAllSpecies();
      // TODO display errors to client
      if (speciesResponse.requestSucceeded) {
        setSpeciesById(speciesResponse.speciesById);
      }
    };

    const populatePlants = async () => {
      if (organization) {
        const sites = getSelectedSites(selectedSite, selectedProject, organization);
        const layers = await getPlantLayers(sites);
        const layerIds = layers.map((layer) => layer.id);
        const plantsResponse = await getPlantsForMultipleLayers(layerIds, filters);
        // TODO display errors to client
        if (plantsResponse.plantErrorByLayerId.size === 0) {
          setPlants(Array.from(plantsResponse.plantsByLayerId.values()).flat());
        }
      }
    };

    populateSpecies();
    populatePlants();
  }, [organization, filters]);

  useEffect(() => {
    fetchPlantsAndSpecies();
  }, [fetchPlantsAndSpecies]);

  useEffect(() => {
    const populateSelectedPlantPhoto = async () => {
      if (selectedPlant) {
        const response = await getPlantPhoto(selectedPlant.featureId!);
        setSelectedPlantPhoto(response.photo.imgSrc ?? undefined);
      } else {
        setSelectedPlantPhoto(undefined);
      }
    };

    populateSelectedPlantPhoto();
  }, [selectedPlant]);

  const getSpeciesNames = (): string[] => {
    const names: string[] = [];
    speciesById.forEach((species) => {
      names.push(species.name);
    });
    return names;
  };

  const selectPlant = (id: number) => {
    setSelectedPlant(plants.find((plant) => plant.featureId === id));
  };

  const onPlantEditSaved = (deleted: boolean) => {
    if (deleted) {
      setSnackbar({
        type: 'delete',
        msg: strings.SNACKBAR_MSG_PLANT_DELETED,
      });
    } else {
      setSnackbar({
        type: 'success',
        msg: strings.SNACKBAR_MSG_CHANGES_SAVED,
      });
    }
    setSelectedPlant(undefined);
    fetchPlantsAndSpecies();
  };

  return (
    <main>
      {selectedPlant && (
        <EditPlantModal
          onSave={onPlantEditSaved}
          onCancel={() => setSelectedPlant(undefined)}
          canDelete={true}
          speciesById={speciesById}
          plant={selectedPlant}
          photoUrl={selectedPlantPhoto}
        />
      )}
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Title
              page={strings.PLANTS}
              parentPage={strings.PLANTS}
              organization={organization}
              allowAll={true}
              setSelectedSiteToParent={(site) => setSelectedSite(site)}
              setSelectedProjectToParent={(project) => setSelectedProject(project)}
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={11}>
            <IconButton
              id='show-filters'
              aria-label='filter'
              onClick={() => setShowFilters(!showFilters)}
              className={classes.filtersButton}
            >
              <TuneIcon className={classes.filtersIcon} />
              <Typography variant='h6'>{strings.FILTERS}</Typography>
            </IconButton>
          </Grid>
          {showFilters && (
            <PlantFilterBar
              speciesNames={getSpeciesNames()}
              filters={filters}
              onApplyFilters={setFilters}
              onClearFilters={() => setFilters(undefined)}
            />
          )}
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
              <React.Suspense fallback={strings.LOADING}>
                <PlantListContent plants={plants} speciesById={speciesById} selectPlant={selectPlant} />
              </React.Suspense>
            </Paper>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}
