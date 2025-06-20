import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { FeatureCollection } from 'geojson';

import { Crumb } from 'src/components/BreadCrumbs';
import { PlantingSiteMap } from 'src/components/Map';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestGetGis } from 'src/redux/features/gis/gisAsyncThunks';
import { selectGisRequest } from 'src/redux/features/gis/gisSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MultiPolygon } from 'src/types/Tracking';

import { useParticipantProjectData } from './ParticipantProjectContext';

const ProjectProfileMap = () => {
  const projectData = useParticipantProjectData();
  const theme = useTheme();
  const [plantingSitesRequestId, setPlantingSitesRequestId] = useState('');
  const [boundariesRequestId, setBoundariesRequestId] = useState('');
  const gisPlantingSitesResponse = useAppSelector(selectGisRequest(plantingSitesRequestId));
  const gisBoundariesResponse = useAppSelector(selectGisRequest(boundariesRequestId));
  const dispatch = useAppDispatch();
  const [plantingSitesData, setPlantingSitesData] = useState<string>('');
  const [boundariesData, setBoundariesData] = useState<string>('');
  const { activeLocale } = useLocalization();

  useEffect(() => {
    // if (projectDetails && 'plantingSitesCql' in projectDetails && projectDetails.plantingSitesCql) {
    // const request = dispatch(requestGetGis(projectDetails.plantingSitesCql));
    const requestBoundaries = dispatch(
      requestGetGis({
        cqlFilter: 'project_no=2',
        typeNames: 'tf_accelerator:project_boundaries',
        propertyName: 'fid,geom,boundary_name',
      })
    );
    setBoundariesRequestId(requestBoundaries.requestId);
    const requestPlantingSites = dispatch(
      requestGetGis({
        cqlFilter: 'project_no=2',
        typeNames: 'tf_accelerator:planting_sites',
        propertyName: 'fid,strata,substrata,site,geom',
      })
    );
    setPlantingSitesRequestId(requestPlantingSites.requestId);
    // }
  }, [dispatch, projectData]);

  useEffect(() => {
    if (gisPlantingSitesResponse?.data) {
      setPlantingSitesData(gisPlantingSitesResponse?.data);
    }
  }, [gisPlantingSitesResponse]);

  useEffect(() => {
    if (gisBoundariesResponse?.data) {
      setBoundariesData(gisBoundariesResponse?.data);
    }
  }, [gisBoundariesResponse]);

  const plantingMapData = useMemo(() => {
    if (plantingSitesData) {
      return MapService.getMapDataFromGisPlantingSites(plantingSitesData as unknown as FeatureCollection<MultiPolygon>);
    }
  }, [plantingSitesData]);

  const boundariesMapData = useMemo(() => {
    if (boundariesData) {
      return MapService.getMapDataFromGisPlantingSites(boundariesData as unknown as FeatureCollection<MultiPolygon>);
    }
  }, [boundariesData]);

  // construct the bread crumbs back to originating context
  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.PROJECTS,
              to: APP_PATHS.ACCELERATOR_OVERVIEW,
            },
            {
              name: projectData?.project?.name ?? '--',
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectData.projectId}`),
            },
          ]
        : [],
    [activeLocale, projectData]
  );

  const projectViewTitle = (
    <Box paddingLeft={1}>
      <Typography fontSize={'24px'} fontWeight={600}>
        {strings.MAPS_FOR} {projectData.participantProject?.dealName}
      </Typography>
    </Box>
  );

  return (
    <Page
      title={projectViewTitle}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      description={strings.MAPS_GIS_DESCRIPTION}
    >
      <Card
        flushMobile
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          marginBottom: theme.spacing(3),
          padding: `${theme.spacing(2, 1)}`,
          borderRadius: theme.spacing(1),
        }}
      >
        {plantingSitesData && plantingMapData && (
          <PlantingSiteMap
            mapData={plantingMapData}
            style={{ width: '100%', borderRadius: '24px' }}
            layers={['Planting Site', 'Zones', 'Sub-Zones']}
          />
        )}
        {boundariesData && boundariesMapData && (
          <PlantingSiteMap
            mapData={boundariesMapData}
            style={{ width: '100%', borderRadius: '24px' }}
            layers={['Planting Site']}
          />
        )}
      </Card>
    </Page>
  );
};

export default ProjectProfileMap;
