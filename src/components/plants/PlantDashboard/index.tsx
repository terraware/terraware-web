import { Table, TableBody, TableContainer, TableRow } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import ErrorBoundary from 'src/ErrorBoundary';
import strings from 'src/strings';
import PlantMap from './PlantMap';
import SpeciesSummaryChart from './SpeciesSummaryChart';
import SummaryCell from './SummaryCell';
import { ServerOrganization } from 'src/types/Organization';
import { getPlantsForMultipleLayers, getPlantSummariesByLayer } from 'src/api/plants/plants';
import { getAllSpecies } from 'src/api/species/species';
import { Plant, PlantSummariesByLayerId } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';
import getColorsBySpeciesId from 'src/api/species/getColorsBySpeciesId';
import Title from 'src/components/common/Title';
import { getPlantLayers } from 'src/api/organization/organization';
import { getSelectedSites } from 'src/utils/organization';
import { useRecoilState } from 'recoil';
import { plantDashboardSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import EmptyMessage from '../../common/EmptyMessage';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    map: {
      width: '100%',
      height: '400px',
    },
    mapContainer: {
      paddingTop: theme.spacing(5),
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
  })
);

export type PlantDashboardProps = {
  organization?: ServerOrganization;
};

export default function PlantDashboard(props: PlantDashboardProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { organization } = props;
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [speciesById, setSpeciesById] = useState<SpeciesById>(new Map());
  const [colorsBySpeciesId, setColorsBySpeciesId] = useState<Record<number, string>>({});
  const [plantSummariesByLayerId, setPlantSummariesByLayerId] = useState<PlantSummariesByLayerId>(new Map());
  const [selectedOrgInfo, setSelectedOrgInfo] = useRecoilState(plantDashboardSelectedOrgInfo);

  const onFullscreenHandler = () => {
    setIsFullscreen(!isFullscreen);
  };

  const reloadData = useCallback(() => {
    const populateSpecies = async () => {
      if (organization) {
        const speciesResponse = await getAllSpecies(organization.id);
        if (speciesResponse.requestSucceeded) {
          setSpeciesById(speciesResponse.speciesById);
          const speciesIds: number[] = Array.from(speciesResponse.speciesById.keys());
          setColorsBySpeciesId(getColorsBySpeciesId(speciesIds));
        }
      }
    };

    const populatePlants = async () => {
      if (organization) {
        const sites = getSelectedSites(selectedOrgInfo.selectedSite, selectedOrgInfo.selectedProject, organization);
        const layers = (await getPlantLayers(sites)).layers;
        const layerIds = layers.map((layer) => layer.id);
        const plantsResponse = await getPlantsForMultipleLayers(layerIds);
        if (plantsResponse.plantErrorByLayerId.size === 0) {
          setPlants(Array.from(plantsResponse.plantsByLayerId.values()).flat());
        }
        // TODO handle error fetching plant data
      }
    };

    const populatePlantSummaries = async () => {
      if (organization) {
        const sites = getSelectedSites(selectedOrgInfo.selectedSite, selectedOrgInfo.selectedProject, organization);
        const layers = (await getPlantLayers(sites)).layers;
        const layerIds = layers.map((layer) => layer.id);
        const summaryResponse = await getPlantSummariesByLayer(layerIds);
        // TODO handle error fetching plant summary data
        if (summaryResponse.plantErrorByLayerId.size === 0) {
          setPlantSummariesByLayerId(summaryResponse.plantSummariesByLayerId);
        }
      }
    };

    populateSpecies();
    populatePlants();
    populatePlantSummaries();
  }, [organization, selectedOrgInfo]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const goToProjects = () => {
    const projectsLocation = {
      pathname: `/projects`,
    };
    history.push(projectsLocation);
  };

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Title
              page={strings.DASHBOARD}
              parentPage={strings.PLANTS}
              organization={organization}
              allowAll={true}
              selectedOrgInfo={selectedOrgInfo}
              onChangeSelectedOrgInfo={(newValues) => setSelectedOrgInfo(newValues)}
            />
          </Grid>
          <Grid item xs={12}>
            {!!organization?.projects?.length && !plantSummariesByLayerId.size && (
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
              <Grid item xs={isFullscreen ? 12 : 6}>
                <React.Suspense fallback={strings.LOADING}>
                  <PlantMap
                    onFullscreen={onFullscreenHandler}
                    isFullscreen={isFullscreen}
                    plants={plants}
                    speciesById={speciesById}
                    colorsBySpeciesId={colorsBySpeciesId}
                    reloadData={reloadData}
                  />
                </React.Suspense>
              </Grid>

              <Grid item xs={isFullscreen ? 12 : 6}>
                <Grid container>
                  <Grid item xs={12}>
                    <TableContainer component={Paper}>
                      <Table aria-label='simple table'>
                        <TableBody>
                          <ErrorBoundary>
                            <React.Suspense fallback={strings.LOADING}>
                              <SummaryCount summary={plantSummariesByLayerId} />
                            </React.Suspense>
                          </ErrorBoundary>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper className={classes.mapContainer}>
                      <ErrorBoundary>
                        <React.Suspense fallback={strings.LOADING}>
                          <SpeciesSummaryChart
                            plantSummariesByLayerId={plantSummariesByLayerId}
                            speciesById={speciesById}
                            colorsBySpeciesId={colorsBySpeciesId}
                            isFullscreen={isFullscreen}
                          />
                        </React.Suspense>
                      </ErrorBoundary>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
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

type SummaryCountProps = {
  summary: PlantSummariesByLayerId;
};

function SummaryCount(props: SummaryCountProps): JSX.Element {
  let lastWeekSpeciesCount = 0;
  let lastWeekPlantsCount = 0;
  let thisWeekSpeciesCount = 0;
  let thisWeekPlantsCount = 0;

  props.summary.forEach((plantSummaries) => {
    plantSummaries.lastWeek?.forEach((plantSummary) => {
      if (plantSummary.speciesId !== -1) {
        lastWeekSpeciesCount += 1;
      }
      lastWeekPlantsCount += plantSummary.numPlants;
    });
    plantSummaries.thisWeek?.forEach((plantSummary) => {
      if (plantSummary.speciesId !== -1) {
        thisWeekSpeciesCount += 1;
      }
      thisWeekPlantsCount += plantSummary.numPlants;
    });
  });

  return (
    <TableRow>
      <SummaryCell title={strings.PLANTS} current={thisWeekPlantsCount} lastWeek={lastWeekPlantsCount} />
      <SummaryCell title={strings.SPECIES} current={thisWeekSpeciesCount} lastWeek={lastWeekSpeciesCount} />
    </TableRow>
  );
}
