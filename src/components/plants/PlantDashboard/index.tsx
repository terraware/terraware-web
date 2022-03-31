import { CircularProgress } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ErrorBoundary from 'src/ErrorBoundary';
import { APP_PATHS, TERRAWARE_SUPPORT_LINK } from 'src/constants';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import PlantMap from './PlantMap';
import SpeciesSummaryChart from './SpeciesSummaryChart';
import SummaryCell from './SummaryCell';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import { getPlantsForMultipleLayers, getPlantSummariesByLayer } from 'src/api/plants/plants';
import { getAllSpecies } from 'src/api/species/species';
import { Plant, PlantSummariesByLayerId } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';
import getColorsBySpeciesId from 'src/api/species/getColorsBySpeciesId';
import Title from 'src/components/common/Title';
import { getPlantLayers } from 'src/api/organization/organization';
import { getAllSites, getSelectedSites } from 'src/utils/organization';
import { useRecoilState } from 'recoil';
import { plantDashboardSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import EmptyMessage from '../../common/EmptyMessage';
import TfMain from 'src/components/common/TfMain';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      padding: '32px 0',
    },
    map: {
      width: '100%',
      height: '400px',
    },
    mapContainer: {
      paddingTop: theme.spacing(5),
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      boxShadow: 'none',
      marginLeft: '24px',
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    summaryContainer: {
      display: 'flex',
    },
    fsSummaryContainer: {
      marginTop: '24px',
    },
    summaryItem: {
      flex: 1,
      padding: theme.spacing(2),
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      boxShadow: 'none',
      marginLeft: '24px',
    },
    emptyMessage: {
      marginBottom: '35px',
    },
    spinnerContainer: {
      position: 'fixed',
      top: '50%',
      left: 'calc(50% + 100px)',
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
  const [plantSummariesByLayerId, setPlantSummariesByLayerId] = useState<PlantSummariesByLayerId>();
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
      pathname: APP_PATHS.PROJECTS,
    };
    history.push(projectsLocation);
  };

  const goToSupport = () => {
    window.open(TERRAWARE_SUPPORT_LINK);
  };

  return (
    <TfMain>
      {organization && plantSummariesByLayerId ? (
        <>
          <Grid container>
            <Grid item xs={12}>
              <Title
                page={strings.DASHBOARD}
                parentPage={strings.PLANTS}
                organization={
                  !!organization.projects?.length && getAllSites(organization).length > 0 ? organization : undefined
                }
                allowAll={true}
                selectedOrgInfo={selectedOrgInfo}
                onChangeSelectedOrgInfo={(newValues) => setSelectedOrgInfo(newValues)}
              />
            </Grid>
          </Grid>
          <Container maxWidth={false} className={classes.mainContainer}>
            <Grid container>
              <Grid item xs={12}>
                {!!organization.projects?.length &&
                  getAllSites(organization).length > 0 &&
                  !plantSummariesByLayerId.size && (
                    <EmptyMessage
                      title={emptyMessageStrings.COLLECT_IN_FIELD_PLANT_DATA}
                      text={emptyMessageStrings.TERRAWARE_MOBILE_APP_INFO_MSG}
                      buttonText={emptyMessageStrings.REQUEST_MOBILE_APP}
                      onClick={goToSupport}
                      className={classes.emptyMessage}
                    />
                  )}
              </Grid>
              {!!organization.projects?.length && getAllSites(organization).length > 0 ? (
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
                        organization={organization}
                      />
                    </React.Suspense>
                  </Grid>

                  <Grid item xs={isFullscreen ? 12 : 6}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ErrorBoundary>
                          <React.Suspense fallback={strings.LOADING}>
                            <SummaryCount summary={plantSummariesByLayerId} isFullscreen={isFullscreen} />
                          </React.Suspense>
                        </ErrorBoundary>
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
              ) : HighOrganizationRolesValues.includes(organization?.role || '') ? (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.PLANTS_EMPTY_MSG_TITLE}
                  text={emptyMessageStrings.PLANTS_EMPTY_MSG_BODY}
                  buttonText={strings.GO_TO_PROJECTS}
                  onClick={goToProjects}
                />
              ) : (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.CHECK_BACK_LATER}
                  text={emptyMessageStrings.EMPTY_MESSAGE_CONTRIBUTOR}
                />
              )}
            </Grid>
          </Container>
        </>
      ) : (
        <div className={classes.spinnerContainer}>
          <CircularProgress />
        </div>
      )}
    </TfMain>
  );
}

type SummaryCountProps = {
  summary: PlantSummariesByLayerId;
  isFullscreen: boolean;
};

function SummaryCount(props: SummaryCountProps): JSX.Element {
  const classes = useStyles();
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
    <div className={`${classes.summaryContainer} ${props.isFullscreen ? classes.fsSummaryContainer : ''}`}>
      <Paper className={classes.summaryItem}>
        <SummaryCell title={strings.PLANTS} current={thisWeekPlantsCount} lastWeek={lastWeekPlantsCount} />
      </Paper>
      <Paper className={classes.summaryItem}>
        <SummaryCell title={strings.SPECIES} current={thisWeekSpeciesCount} lastWeek={lastWeekSpeciesCount} />
      </Paper>
    </div>
  );
}
