import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { FeatureCollection } from 'geojson';

import { Crumb } from 'src/components/BreadCrumbs';
import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestGetGis } from 'src/redux/features/gis/gisAsyncThunks';
import { selectGisRequest } from 'src/redux/features/gis/gisSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapData, MapEntity, MapSourceProperties } from 'src/types/Map';
import { MultiPolygon } from 'src/types/Tracking';

import { useParticipantProjectData } from './ParticipantProjectContext';

type ZoneOrSiteOption = { name: string; type: 'zone' | 'site'; showSeparator?: boolean };
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
  const [selectedArea, setSelectedArea] = useState<string>();
  const [showSiteMap, setShowSiteMap] = useState(false);
  const [showBoundaryMap, setShowBoundaryMap] = useState(false);
  const [isProcessingSite, setIsProcessingSite] = useState(false);
  const [processedSiteData, setProcessedSiteData] = useState<any>(null);
  const { isDesktop } = useDeviceInfo();
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>();

  useEffect(() => {
    const projectDetails = projectData.participantProject;
    if (projectDetails && projectDetails.projectBoundariesCql) {
      const requestBoundaries = dispatch(
        requestGetGis({
          cqlFilter: projectDetails.projectBoundariesCql,
          typeNames: 'tf_accelerator:project_boundaries',
          propertyName: 'fid,geom,boundary_name',
        })
      );
      setBoundariesRequestId(requestBoundaries.requestId);
    }

    if (projectDetails && projectDetails.plantingSitesCql) {
      const requestPlantingSites = dispatch(
        requestGetGis({
          cqlFilter: projectDetails.plantingSitesCql,
          typeNames: 'tf_accelerator:planting_sites',
          propertyName: 'fid,strata,substrata,site,geom,created_at',
        })
      );
      setPlantingSitesRequestId(requestPlantingSites.requestId);
    }
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

  const mapsNotUploaded = useMemo(() => {
    return !projectData.participantProject?.projectBoundariesCql && !projectData.participantProject?.plantingSitesCql;
  }, [projectData]);

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

  const basePlantingMapData = useMemo(() => {
    if (plantingSitesData) {
      return MapService.getMapDataFromGisPlantingSites(plantingSitesData);
    }
    return undefined;
  }, [plantingSitesData]);

  // Process site data asynchronously
  useEffect(() => {
    if (!plantingSitesData || !showSiteMap || !zoneOrSite || zoneOrSite.type !== 'site') {
      setIsProcessingSite(false);
      setProcessedSiteData(null);
      return;
    }

    setIsProcessingSite(true);

    // Process in next frame to avoid blocking UI
    requestAnimationFrame(() => {
      const filteredFeatures = plantingSitesData.features.filter((f) => f.properties?.site === zoneOrSite.name);

      if (filteredFeatures.length === 0) {
        setProcessedSiteData(basePlantingMapData);
        setIsProcessingSite(false);
        return;
      }

      const filteredPlantingSitesData = {
        ...plantingSitesData,
        features: filteredFeatures,
      };

      const mapData = MapService.getMapDataFromGisPlantingSites(
        filteredPlantingSitesData as unknown as FeatureCollection<MultiPolygon>
      );

      setProcessedSiteData(mapData);
      setIsProcessingSite(false);
    });
  }, [plantingSitesData, showSiteMap, zoneOrSite, basePlantingMapData]);

  const filteredSiteData = useMemo(() => {
    if (!showSiteMap || !zoneOrSite || zoneOrSite.type !== 'site') {
      return basePlantingMapData;
    }
    return processedSiteData || basePlantingMapData;
  }, [showSiteMap, zoneOrSite, processedSiteData, basePlantingMapData]);

  const filteredZoneData = useMemo(() => {
    if (!boundariesData) {
      return undefined;
    }

    if (!showBoundaryMap || !zoneOrSite || zoneOrSite.type !== 'zone') {
      return boundariesMapData;
    }

    if (zoneOrSite.name === strings.ALL_PROJECT_ZONES) {
      const boundariesMapDataToReturn = { ...boundariesMapData } as MapData;
      boundariesMapDataToReturn.site?.entities.forEach((ent: MapEntity) => (ent.properties.name = ''));
      return boundariesMapDataToReturn;
    }

    const filteredBoundaryData = {
      ...boundariesData,
      features: boundariesData.features.filter((f) => f.properties?.boundary_name === zoneOrSite.name),
    };

    if (filteredBoundaryData.features && filteredBoundaryData.features.length > 0) {
      return MapService.getMapDataFromGisPlantingSites(
        filteredBoundaryData as unknown as FeatureCollection<MultiPolygon>
      );
    }

    return boundariesMapData;
  }, [boundariesData, showBoundaryMap, zoneOrSite, boundariesMapData]);

  const calculateArea = useCallback(() => {
    let totalArea = '';

    if (showSiteMap && zoneOrSite && zoneOrSite.type === 'site' && plantingSitesData) {
      const filteredFeatures = plantingSitesData.features.filter((f) => f.properties?.site === zoneOrSite.name);
      if (filteredFeatures.length > 0) {
        const filteredPlantingSitesData = {
          ...plantingSitesData,
          features: filteredFeatures,
        };
        totalArea = MapService.calculateAreaFromGisData(
          filteredPlantingSitesData as unknown as FeatureCollection<MultiPolygon>
        );
      }
    } else if (showBoundaryMap && zoneOrSite && zoneOrSite.type === 'zone' && boundariesData) {
      if (zoneOrSite.name === strings.ALL_PROJECT_ZONES) {
        totalArea = MapService.calculateAreaFromGisData(boundariesData as unknown as FeatureCollection<MultiPolygon>);
      } else {
        const filteredFeatures = boundariesData.features.filter((f) => f.properties?.boundary_name === zoneOrSite.name);
        if (filteredFeatures.length > 0) {
          const filteredBoundaryData = {
            ...boundariesData,
            features: filteredFeatures,
          };
          totalArea = MapService.calculateAreaFromGisData(
            filteredBoundaryData as unknown as FeatureCollection<MultiPolygon>
          );
        }
      }
    }

    setSelectedArea(totalArea);
  }, [boundariesData, plantingSitesData, showBoundaryMap, showSiteMap, zoneOrSite]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const frameId = requestAnimationFrame(() => {
      timeoutId = setTimeout(calculateArea, 50);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showSiteMap, showBoundaryMap, zoneOrSite, plantingSitesData, boundariesData, calculateArea]);

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
    const iUniqueZones = Array.from(new Set(boundariesData?.features?.map((f) => f.properties?.boundary_name)));
    if (iUniqueZones.length > 1) {
      iUniqueZones.unshift(strings.ALL_PROJECT_ZONES);
    }
    return iUniqueZones;
  }, [boundariesData]);

  const uniqueSites = useMemo(() => {
    return Array.from(new Set(plantingSitesData?.features?.map((f) => f.properties?.site)));
  }, [plantingSitesData]);

  const zonesAndSites = useMemo(() => {
    const zones = uniqueZones?.map((z) => ({ name: z, type: 'zone' }) as ZoneOrSiteOption);
    const sites = uniqueSites?.map((s) => ({ name: s, type: 'site' }) as ZoneOrSiteOption);
    if (zones.length > 0 && sites[0]) {
      sites[0].showSeparator = true;
    }
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
        setSelectedLayer(undefined);
      } else if (zoneOrSite.type === 'site' && uniqueSites.includes(zoneOrSite.name)) {
        setShowSiteMap(true);
        setShowBoundaryMap(false);
        setSelectedLayer('Planting Site');
      } else if (zoneOrSite.type === 'zone' && uniqueZones.includes(zoneOrSite.name)) {
        setShowBoundaryMap(true);
        setShowSiteMap(false);
        setSelectedLayer(undefined);
      }
    }
  }, [uniqueSites, uniqueZones, zoneOrSite, zonesAndSites]);

  const labelHandler = useCallback((iZoneOrSite: ZoneOrSiteOption) => iZoneOrSite?.name, []);
  const isEqualHandler = useCallback(
    (zoneOrSiteA: ZoneOrSiteOption, zoneOrSiteB: ZoneOrSiteOption) =>
      zoneOrSiteA.name === zoneOrSiteB.name && zoneOrSiteA.type === zoneOrSiteB.type,
    []
  );

  const renderOptionHandler = useCallback((iZoneOrSite: ZoneOrSiteOption) => {
    return (
      <Typography
        component='div'
        sx={{
          borderTop: iZoneOrSite.showSeparator ? '1px solid' : 'none',
          padding: '8px 16px',
        }}
      >
        {iZoneOrSite.name}
      </Typography>
    );
  }, []);

  const toTHandler = useCallback(
    (input: string) =>
      ({
        name: input,
      }) as ZoneOrSiteOption,
    []
  );

  const zonesAndSitesDropdown = (
    <Box display='flex' alignItems='center' gap={1}>
      <SelectT
        id='zoneOrSite'
        label=''
        onChange={setZoneOrSite}
        options={zonesAndSites}
        placeholder={''}
        selectedValue={zoneOrSite}
        selectStyles={{ optionsContainer: { textAlign: 'left' }, optionContainer: { padding: 0 } }}
        displayLabel={labelHandler}
        isEqual={isEqualHandler}
        renderOption={renderOptionHandler}
        toT={toTHandler}
      />
      {isProcessingSite && <CircularProgress size={16} sx={{ color: theme.palette.TwClrTxtSecondary }} />}
    </Box>
  );

  const projectViewTitle = (
    <Box paddingLeft={1}>
      <Typography fontSize={'24px'} fontWeight={600}>
        {strings.MAPS_FOR} {projectData.participantProject?.dealName}
      </Typography>
    </Box>
  );

  const onChangeLayerHandler = useCallback((layer: string) => {
    setSelectedLayer(layer as MapLayer);
  }, []);

  const lastUpdatedDate = useMemo(() => {
    const allDates = plantingSitesData?.features?.map((f) => f.properties?.created_at);
    const validDates = allDates?.filter((date) => date)?.map((date) => new Date(date).getTime());
    const lastUpdated = validDates?.length ? new Date(Math.max(...validDates)) : null;
    return lastUpdated;
  }, [plantingSitesData]);

  const contextRenderer = useCallback(
    (properties: MapSourceProperties): JSX.Element | null => {
      const tooltipProperties: TooltipProperty[] = [{ key: strings.TYPE, value: properties.type }];

      if (properties.type === 'subzone') {
        const selectedSubZone = filteredSiteData?.subzone?.entities?.find((ent: MapEntity) => ent.id === properties.id);
        tooltipProperties.push({
          key: strings.ZONE,
          value: filteredSiteData?.subzone?.entities?.[0].properties.zoneId,
        });
        tooltipProperties.push({
          key: strings.AREA_HA,
          value: selectedSubZone && 'totalArea' in selectedSubZone ? String(selectedSubZone.totalArea) : '',
        });
      }

      if (properties.type === 'zone') {
        const selectedZone = filteredSiteData?.zone?.entities?.find((ent: MapEntity) => ent.id === properties.id);
        tooltipProperties.push({
          key: strings.AREA_HA,
          value: selectedZone && 'totalArea' in selectedZone ? String(selectedZone.totalArea) : '',
        });
      }

      if (properties.type === 'site') {
        const siteEntity = filteredSiteData?.site?.entities?.[0];
        tooltipProperties.push({
          key: strings.AREA_HA,
          value: siteEntity && 'totalArea' in siteEntity ? String(siteEntity.totalArea) : '',
        });
      }

      return (
        <MapTooltip title={properties.name} subtitleColor={theme.palette.TwClrTxt} properties={tooltipProperties} />
      );
    },
    [filteredSiteData, theme.palette]
  );

  return (
    <Page
      title={projectViewTitle}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      description={strings.MAPS_GIS_DESCRIPTION}
      rightComponent={mapsNotUploaded ? undefined : zonesAndSitesDropdown}
      descriptionStyle={{ paddingLeft: 1 }}
    >
      <Card
        flushMobile
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          marginBottom: theme.spacing(3),
          padding: `${theme.spacing(2, 3)}`,
          borderRadius: theme.spacing(1),
        }}
      >
        {zoneOrSite?.name && (
          <Box display='flex' alignItems='center' paddingBottom={2}>
            <Typography fontSize={'20px'} fontWeight={600} paddingRight={1}>
              {zoneOrSite.name}
            </Typography>
            <Typography fontSize={'16px'} fontWeight={400} paddingRight={1}>
              {strings.FROM_GIS_DATABASE}
            </Typography>
            {lastUpdatedDate && (
              <Typography fontSize={'16px'} fontWeight={400} paddingRight={1}>
                {strings.LAST_UPDATED} {getDateDisplayValue(lastUpdatedDate)}
              </Typography>
            )}
            {selectedArea && (
              <Typography fontSize={'20px'} fontWeight={600}>
                {strings.formatString(strings.X_HA, selectedArea)}
              </Typography>
            )}
          </Box>
        )}
        <Box display='flex' flexDirection={isDesktop ? 'row' : 'column-reverse'} flexGrow={1}>
          <PlantingSiteMapLegend
            options={['site', 'stratum', 'substratum']}
            onChangeLayer={showSiteMap ? onChangeLayerHandler : undefined}
            selectedLayer={selectedLayer || 'Project Zones'}
            disableLegends={!showSiteMap}
          />
          {plantingSitesData && plantingMapData && showSiteMap && filteredSiteData && (
            <PlantingSiteMap
              mapData={filteredSiteData}
              style={{ width: '100%', borderRadius: theme.spacing(1) }}
              layers={[selectedLayer || 'Planting Site', 'Planting Site']}
              contextRenderer={{
                render: contextRenderer,
                sx: {
                  '.mapboxgl-popup': {
                    maxWidth: '324px !important', // !important to override a default mapbox style
                  },
                  '.mapboxgl-popup .mapboxgl-popup-content': {
                    padding: '0px !important',
                  },
                },
              }}
              showSiteMarker
              minHeight='700px'
            />
          )}
          {boundariesData && boundariesMapData && showBoundaryMap && filteredZoneData && (
            <PlantingSiteMap
              mapData={filteredZoneData}
              style={{ width: '100%', borderRadius: theme.spacing(1) }}
              layers={['Project Zones']}
              minHeight='700px'
            />
          )}
          {mapsNotUploaded && (
            <Box position='relative' width={'100%'} height={'100%'}>
              <PlantingSiteMap
                mapData={{
                  site: undefined,
                  stratum: undefined,
                  substratum: undefined,
                  permanentPlot: undefined,
                  temporaryPlot: undefined,
                  adHocPlot: undefined,
                }}
                style={{ width: '100%', borderRadius: theme.spacing(1) }}
                layers={['Planting Site', 'Strata', 'Sub-Strata']}
                minHeight='700px'
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  zIndex: 1000,
                  cursor: 'not-allowed',
                  display: 'flex',
                  justifyContent: 'center',
                  verticalAlign: 'middle',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    padding: theme.spacing(2),
                    color: theme.palette.TwClrTxtSecondary,
                    borderRadius: theme.spacing(1),
                    background: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  {strings.MAP_NOT_UPLOADED}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Page>
  );
};

export default ProjectProfileGisMaps;
