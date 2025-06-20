import React, { useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import { FeatureCollection } from 'geojson';

import { PlantingSiteMap } from 'src/components/Map';
import Card from 'src/components/common/Card';
import { requestGetGis } from 'src/redux/features/gis/gisAsyncThunks';
import { selectGisRequest } from 'src/redux/features/gis/gisSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
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

  useEffect(() => {
    // if (projectDetails && 'plantingSitesCql' in projectDetails && projectDetails.plantingSitesCql) {
    // const request = dispatch(requestGetGis(projectDetails.plantingSitesCql));
    const requestBoundaries = dispatch(
      requestGetGis({
        cqlFilter: 'project_no=2',
        typeNames: 'tf_accelerator:project_boundaries',
        propertyName: 'fid,geom',
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

  return (
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
  );
};

export default ProjectProfileMap;
