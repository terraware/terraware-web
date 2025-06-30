import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { FeatureCollection } from 'geojson';

import { Crumb } from 'src/components/BreadCrumbs';
import { PlantingSiteMap } from 'src/components/Map';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestGetGis } from 'src/redux/features/gis/gisAsyncThunks';
import { selectGisRequest } from 'src/redux/features/gis/gisSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MultiPolygon } from 'src/types/Tracking';

import { useParticipantProjectData } from './ParticipantProjectContext';

type ZoneOrSiteOption = { name: string; type: 'zone' | 'site' };
const ProjectProfileGisMaps = () => {
  const projectData = useParticipantProjectData();
  const theme = useTheme();
  const [plantingSitesRequestId, setPlantingSitesRequestId] = useState('');
  const [boundariesRequestId, setBoundariesRequestId] = useState('');
  const gisPlantingSitesResponse = useAppSelector(selectGisRequest(plantingSitesRequestId));
  const gisBoundariesResponse = useAppSelector(selectGisRequest(boundariesRequestId));
  const dispatch = useAppDispatch();
  const [plantingSitesData, setPlantingSitesData] = useState<FeatureCollection<MultiPolygon>>();
  const [boundariesData, setBoundariesData] = useState<FeatureCollection<MultiPolygon>>();
  const { activeLocale } = useLocalization();
  const [zoneOrSite, setZoneOrSite] = useState<ZoneOrSiteOption>();
  const [showSiteMap, setShowSiteMap] = useState(false);
  const [showBoundaryMap, setShowBoundaryMap] = useState(false);
  const { isDesktop } = useDeviceInfo();

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
      setPlantingSitesData(gisPlantingSitesResponse?.data as unknown as FeatureCollection<MultiPolygon>);
    }
  }, [gisPlantingSitesResponse]);

  useEffect(() => {
    if (gisBoundariesResponse?.data) {
      setBoundariesData(gisBoundariesResponse?.data as unknown as FeatureCollection<MultiPolygon>);
    }
  }, [gisBoundariesResponse]);

  const plantingMapData = useMemo(() => {
    if (plantingSitesData) {
      return MapService.getMapDataFromGisPlantingSites(plantingSitesData);
    }
  }, [plantingSitesData]);

  const boundariesMapData = useMemo(() => {
    if (boundariesData) {
      return MapService.getMapDataFromGisPlantingSites(boundariesData);
    }
  }, [boundariesData]);

  const filteredSiteData = useMemo(() => {
    if (plantingSitesData) {
      if (showSiteMap && zoneOrSite && zoneOrSite.type === 'site') {
        const filteredPlantingSitesData = {
          ...plantingSitesData,
          features: plantingSitesData.features.filter((f) => f.properties?.site === zoneOrSite.name),
        };
        if (filteredPlantingSitesData.features) {
          return MapService.getMapDataFromGisPlantingSites(
            filteredPlantingSitesData as unknown as FeatureCollection<MultiPolygon>
          );
        }
      }
      return MapService.getMapDataFromGisPlantingSites(plantingSitesData);
    }
  }, [plantingSitesData, showSiteMap, zoneOrSite]);

  const filteredZoneData = useMemo(() => {
    if (boundariesData) {
      if (
        showBoundaryMap &&
        zoneOrSite &&
        zoneOrSite.type === 'zone' &&
        zoneOrSite.name !== strings.ALL_PROJECT_ZONES
      ) {
        const filteredBoundaryData = {
          ...boundariesData,
          features: boundariesData.features.filter((f) => f.properties?.boundary_name === zoneOrSite.name),
        };
        if (filteredBoundaryData.features) {
          return MapService.getMapDataFromGisPlantingSites(
            filteredBoundaryData as unknown as FeatureCollection<MultiPolygon>
          );
        }
      }
      return MapService.getMapDataFromGisPlantingSites(boundariesData);
    }
  }, [boundariesData, showBoundaryMap, zoneOrSite]);

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

  const uniqueZones = useMemo(() => {
    const iUniqueZones = Array.from(new Set(boundariesData?.features.map((f) => f.properties?.boundary_name)));
    if (iUniqueZones.length > 1) {
      iUniqueZones.unshift(strings.ALL_PROJECT_ZONES);
    }
    return iUniqueZones;
  }, [boundariesData]);

  const uniqueSites = useMemo(() => {
    return Array.from(new Set(plantingSitesData?.features.map((f) => f.properties?.site)));
  }, [plantingSitesData]);

  const zonesAndSites = useMemo(() => {
    const zones = uniqueZones.map((z) => ({ name: z, type: 'zone' }) as ZoneOrSiteOption);
    const sites = uniqueSites.map((s) => ({ name: s, type: 'site' }) as ZoneOrSiteOption);
    return [...zones, ...sites];
  }, [uniqueZones, uniqueSites]);

  useEffect(() => {
    if (!zoneOrSite && zonesAndSites) {
      setZoneOrSite(zonesAndSites[0]);
    }
  }, [zoneOrSite, zonesAndSites]);

  useEffect(() => {
    if (zoneOrSite) {
      if (zoneOrSite.name === strings.ALL_PROJECT_ZONES) {
        setShowBoundaryMap(true);
        setShowSiteMap(false);
      } else if (zoneOrSite.type === 'site' && uniqueSites.includes(zoneOrSite.name)) {
        setShowSiteMap(true);
        setShowBoundaryMap(false);
      } else if (zoneOrSite.type === 'zone' && uniqueZones.includes(zoneOrSite.name)) {
        setShowBoundaryMap(true);
        setShowSiteMap(false);
      }
    }
  }, [uniqueSites, uniqueZones, zoneOrSite, zonesAndSites]);

  const labelHandler = useCallback((iZoneOrSite: ZoneOrSiteOption) => iZoneOrSite?.name, []);
  const isEqualHandler = useCallback(
    (zoneOrSiteA: ZoneOrSiteOption, zoneOrSiteB: ZoneOrSiteOption) =>
      zoneOrSiteA.name === zoneOrSiteB.name && zoneOrSiteA.type === zoneOrSiteB.type,
    []
  );
  const renderOptionHandler = useCallback((iZoneOrSite: ZoneOrSiteOption) => iZoneOrSite?.name, []);
  const toTHandler = useCallback(
    (input: string) =>
      ({
        name: input,
      }) as ZoneOrSiteOption,
    []
  );

  const zonesAndSitesDropdown = (
    <SelectT
      id='zoneOrSite'
      label=''
      onChange={setZoneOrSite}
      options={zonesAndSites}
      placeholder={''}
      selectedValue={zoneOrSite}
      selectStyles={{ optionsContainer: { textAlign: 'left' } }}
      displayLabel={labelHandler}
      isEqual={isEqualHandler}
      renderOption={renderOptionHandler}
      toT={toTHandler}
    />
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
      rightComponent={zonesAndSitesDropdown}
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
        {zoneOrSite?.name && (
          <Box display='flex' alignItems='center' paddingBottom={2}>
            <Typography fontSize={'20px'} fontWeight={600} paddingRight={1}>
              {zoneOrSite.name}
            </Typography>
            <Typography fontSize={'16px'} fontWeight={400}>
              {strings.FROM_GIS_DATABASE}
            </Typography>
          </Box>
        )}
        <Box display='flex' flexDirection={isDesktop ? 'row' : 'column-reverse'} flexGrow={1}>
          <PlantingSiteMapLegend options={['site', 'zone', 'subzone']} />
          {plantingSitesData && plantingMapData && showSiteMap && filteredSiteData && (
            <PlantingSiteMap
              mapData={filteredSiteData}
              style={{ width: '100%', borderRadius: '24px' }}
              layers={['Planting Site', 'Zones', 'Sub-Zones']}
            />
          )}
          {boundariesData && boundariesMapData && showBoundaryMap && filteredZoneData && (
            <PlantingSiteMap
              mapData={filteredZoneData}
              style={{ width: '100%', borderRadius: '24px' }}
              layers={['Project Zones']}
            />
          )}
        </Box>
      </Card>
    </Page>
  );
};

export default ProjectProfileGisMaps;
