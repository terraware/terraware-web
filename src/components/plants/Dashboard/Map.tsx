import { Chip, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import ReactMapGL, { MapContext, MapEvent, NavigationControl, Popup, Source } from 'react-map-gl';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Feature } from '../../../api/types/feature';
import snackbarAtom from '../../../state/atoms/snackbar';
import { plantsByFeatureIdSelector } from '../../../state/selectors/plants';
import { plantsFeaturesWithGeolocationSelector } from '../../../state/selectors/plantsFeatures';
import speciesForChartSelector from '../../../state/selectors/speciesForChart';
import strings from '../../../strings';
import { getCenter, getCoordinates } from '../../../utils/maps';
import { cellDateFormatter } from '../../common/table/TableCellRenderer';
import MapLayers from './MapLayers';
import NewSpecieModal from './NewSpecieModal';
import PlantPhoto from './PlantPhoto';

const useStyles = makeStyles((theme) =>
  createStyles({
    newSpecies: {
      marginTop: theme.spacing(2),
      width: '100%',
      background: 'transparent',
      border: '1px solid',

      '&:focus': {
        background: 'transparent',
      },
    },
    fullscreen: {
      background: theme.palette.common.white,
      borderRadius: 0,
      padding: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
      zIndex: 10,
      '&:hover': {
        backgroundColor: theme.palette.common.white,
      },
    },
    spacing: {
      margin: theme.spacing(1, 0),
    },
  })
);

export interface SpecieMap {
  geometry: {
    coordinates: number[];
  };
  properties: {
    SPECIE_ID: number;
    NAME: string;
    DATE: string;
    IMG: string;
    MARKER?: string;
  };
}

interface ViewportProps {
  zoom: number;
  width: string;
  height: string;
}

interface MapboxFeaturesProps {
  /** A JSON string for the Terraware Feature (Mapbox internally converts all properties into strings) */
  feature: string;
  color: string;
}

const navControlStyle = { right: 10, bottom: 10, zIndex: 10, };
const DEFAULT_VIEWPORT: ViewportProps = { zoom: 8, width: 'fit', height: '100%' };

interface Props {
  onFullscreen: () => void;
  isFullscreen: boolean;
}

function Map({ onFullscreen, isFullscreen }: Props): JSX.Element {
  const classes = useStyles();
  const [selectedFeature, setSelectedFeature] = React.useState<Feature>();
  const [editPlantModalOpen, setEditPlantModalOpen] = React.useState(false);
  const [viewport, setViewport] = React.useState(DEFAULT_VIEWPORT);
  const [selectedCoordinates, setSelectedCoordinates] = React.useState<[number, number]>();

  const features = useRecoilValue(plantsFeaturesWithGeolocationSelector);
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const plantsByFeatureId = useRecoilValue(plantsByFeatureIdSelector);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const center = getCenter(features);

  React.useEffect(() => {
    setViewport({ ...DEFAULT_VIEWPORT, height: '60vh' });
  }, [isFullscreen]);

  useCenterMap(center, setViewport);

  const geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = React.useMemo(() => (
    {
      type: 'FeatureCollection',
      features: (plantsByFeatureId && features) ? features.map((feature) => {
        const coordinates = getCoordinates(feature);
        const plant = plantsByFeatureId[feature.id!];
        const properties: MapboxFeaturesProps = { feature: JSON.stringify(feature), color: speciesForChart[plant.speciesId!].color };

        return {
          type: 'Feature',
          properties,
          geometry: {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude]
          }
        };
      }) : []
    })
    , [features, plantsByFeatureId, speciesForChart]);

  const selectedPlant = selectedFeature && plantsByFeatureId
    ? plantsByFeatureId[selectedFeature.id!]
    : undefined;

  const selectedPlantForTable = selectedPlant && selectedFeature ? {
    date: selectedPlant.datePlanted,
    species: speciesForChart[selectedPlant.speciesId!]
      ? speciesForChart[selectedPlant.speciesId!].speciesName.name
      : undefined,
    geolocation:
      selectedFeature.geom &&
        Array.isArray(selectedFeature?.geom.coordinates)
        ? `${selectedFeature.geom.coordinates[1].toFixed(
          6
        )}, ${selectedFeature.geom.coordinates[0].toFixed(6)}`
        : undefined,
    notes: selectedFeature.notes,
    featureId: selectedFeature.id,
    speciesId: selectedPlant.speciesId,
  } : undefined;

  const onCloseEditPlantModal = (snackbarMessage?: string) => {
    setEditPlantModalOpen(false);
    if (snackbarMessage) {
      setSnackbar({
        type: 'success',
        msg: snackbarMessage,
      });
    }
  };

  const onNewSpecie = () => {
    setEditPlantModalOpen(true);
  };

  const onViewportChange = (newViewport: any) => {
    setViewport({ ...newViewport, width: 'fit' });
  };

  const onClick = (event: MapEvent) => {
    if (!event.features) { return; }

    if (event.features && event.features.length > 0) {
      const eventFeature = event.features[0];
      const layerId = eventFeature.layer.id;

      if (layerId === 'unclustered-point') {
        const lngLat = event.lngLat;


        if (eventFeature.properties) {
          const properties: MapboxFeaturesProps = eventFeature.properties;
          const feature = JSON.parse(properties.feature);

          setSelectedCoordinates(lngLat);
          setSelectedFeature(feature);
        }

      }
    }
  };

  return (
    <>
      <NewSpecieModal
        open={editPlantModalOpen}
        onClose={onCloseEditPlantModal}
        value={selectedPlantForTable}
      />
      <ReactMapGL
        latitude={center.latitude}
        longitude={center.longitude}
        {...viewport}
        onViewportChange={onViewportChange}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle='mapbox://styles/mapbox/satellite-v9'
        interactiveLayerIds={['unclustered-point']}
        onClick={onClick}
      >
        {/* https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson-clusterRadius */}
        <Source
          id='plants'
          type='geojson'
          data={geojson}
          cluster={true}
          clusterMaxZoom={5}
        >
          <MapLayers />
        </Source>
        <NavigationControl showCompass={false} style={navControlStyle} />
        <div style={{ position: 'absolute', right: 0, bottom: 80 }}>
          <IconButton id='full-screen' onClick={onFullscreen} className={classes.fullscreen}>
            <FullscreenIcon />
          </IconButton>
        </div>
        {selectedFeature && selectedPlant && selectedCoordinates && (
          <Popup
            onClose={() => { setSelectedFeature(undefined); setSelectedCoordinates(undefined); }}
            latitude={selectedCoordinates[1]}
            longitude={selectedCoordinates[0]}
            captureClick={false}
            closeOnClick={false}
            anchor='top'
          >
            <div>
              <Typography component='p' variant='subtitle2' id='feature-species-name'>
                {selectedPlant.speciesId
                  ? speciesForChart[selectedPlant.speciesId].speciesName.name
                  : strings.OTHER}
              </Typography>
              <Typography component='p' variant='body2' className={classes.spacing} >
                {strings.AS_OF}{' '}
                {cellDateFormatter(selectedFeature.enteredTime)}
              </Typography>
              <Typography component='p' variant='body2' className={classes.spacing} id='feature-coordinates'>
                {selectedCoordinates ? selectedCoordinates[1].toFixed(6) : 0},
                {selectedCoordinates ? selectedCoordinates[0].toFixed(6) : 0}
              </Typography>
              <PlantPhoto featureId={selectedFeature?.id} />
              <Chip
                id='new-species'
                size='medium'
                label={selectedPlant.speciesId ? strings.EDIT_SPECIES : strings.ADD_SPECIES}
                onClick={onNewSpecie}
                className={classes.newSpecies}
                icon={selectedPlant.speciesId ? <CreateIcon /> : <AddIcon />}
              />
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </>
  );
}

export default React.memo(Map);

function useCenterMap(center: { latitude: number; longitude: number }, setViewport: (viewport: ViewportProps) => void) {
  const { map } = React.useContext(MapContext);
  const [lat, setLat] = React.useState(center.latitude);
  const [long, setLong] = React.useState(center.longitude);

  React.useEffect(() => {
    if (center && (center.longitude !== long || center.latitude !== lat)) {
      map.jumpTo({
        center: [center.longitude, center.latitude],
        essential: true,
      });
      setViewport({ ...DEFAULT_VIEWPORT, height: '60vh' });
      setLat(center.latitude);
      setLong(center.longitude);
    }
  }, [center, lat, long, map, setViewport]);
}
