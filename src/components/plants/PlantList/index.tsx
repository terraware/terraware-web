import { Container, createStyles, Grid, IconButton, makeStyles, Paper, Typography } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import strings from 'src/strings';
import EditPlantModal from '../EditPlantModal';
import PlantFilterBar from './PlantFilterBar';
import PlantListContent from './PlantListContent';
import { getAllSpecies } from 'src/api/species/species';
import { getPlantsForMultipleLayers } from 'src/api/plants/plants';
import { getPlantPhoto } from 'src/api/plants/photo';
import { Plant, PlantSearchOptions } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';
import { ServerOrganization } from 'src/types/Organization';
import Title from 'src/components/common/Title';
import { getPlantLayers } from 'src/api/organization/organization';
import { getSelectedSites } from 'src/utils/organization';
import { plantListSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import EmptyMessage from '../../common/EmptyMessage';
import { useHistory } from 'react-router-dom';

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
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
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
  const history = useHistory();
  const { organization, filters, setFilters } = props;
  const [speciesById, setSpeciesById] = useState<SpeciesById>(new Map());
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant>();
  const [selectedPlantPhoto, setSelectedPlantPhoto] = useState<string>();
  const [showFilters, setShowFilters] = useState(filters ? true : false);
  const [selectedOrgInfo, setSelectedOrgInfo] = useRecoilState(plantListSelectedOrgInfo);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const fetchPlantsAndSpecies = useCallback(() => {
    const populateSpecies = async () => {
      if (organization) {
        const speciesResponse = await getAllSpecies(organization.id);
        // TODO display errors to client
        if (speciesResponse.requestSucceeded) {
          setSpeciesById(speciesResponse.speciesById);
        }
      }
    };

    const populatePlants = async () => {
      if (organization) {
        const sites = getSelectedSites(selectedOrgInfo.selectedSite, selectedOrgInfo.selectedProject, organization);
        const layers = (await getPlantLayers(sites)).layers;
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
  }, [organization, filters, selectedOrgInfo]);

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

  const goToProjects = () => {
    const projectsLocation = {
      pathname: `/projects`,
    };
    history.push(projectsLocation);
  };

  return (
    <main>
      {selectedPlant && organization && (
        <EditPlantModal
          onSave={onPlantEditSaved}
          onCancel={() => setSelectedPlant(undefined)}
          canDelete={true}
          speciesById={speciesById}
          plant={selectedPlant}
          photoUrl={selectedPlantPhoto}
          organization={organization}
        />
      )}
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Title
              page={strings.PLANTS}
              parentPage={strings.PLANTS}
              organization={!!organization?.projects?.length ? organization : undefined}
              allowAll={true}
              onChangeSelectedOrgInfo={(newValues) => setSelectedOrgInfo(newValues)}
              selectedOrgInfo={selectedOrgInfo}
            />
          </Grid>
          <Grid item xs={12}>
            {!!organization?.projects?.length && !plants.length && (
              <EmptyMessage
                title={strings.COLLECT_IN_FIELD_PLANT_DATA}
                text={strings.TERRAWARE_MOBILE_APP_INFO_MSG}
                buttonText={strings.REQUEST_MOBILE_APP}
                onClick={goToProjects}
              />
            )}
          </Grid>
          {!!organization?.projects?.length ? (
            <>
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
            </>
          ) : ['Admin', 'Manager', 'Owner'].includes(organization?.role || '') ? (
            <EmptyMessage
              className={classes.message}
              title={strings.PLANTS_EMPTY_MSG_TITLE}
              text={strings.PLANTS_EMPTY_MSG_BODY}
              buttonText={strings.GO_TO_PROJECTS}
              onClick={goToProjects}
            />
          ) : (
            <EmptyMessage
              className={classes.message}
              title={strings.CHECK_BACK_LATER}
              text={strings.EMPTY_MESSAGE_CONTRIBUTOR}
            />
          )}
        </Grid>
      </Container>
    </main>
  );
}
