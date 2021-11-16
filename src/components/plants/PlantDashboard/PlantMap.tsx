import { Chip, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState, memo } from 'react';
import ReactMapGL, {
  MapContext,
  MapEvent,
  NavigationControl,
  Popup,
  Source,
} from 'react-map-gl';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/atoms/snackbar';
import strings from 'src/strings';
import { cellDateFormatter } from '../../common/table/TableCellRenderer';
import MapLayers from './MapLayers';
import EditPlantModal from '../EditPlantModal';
import DisplayPhoto from '../DisplayPhoto';
import { Plant } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';
import { getPlantPhoto } from 'src/api/plants/photo';

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

interface ViewportProps {
  zoom: number;
  width: string;
  height: string;
}

interface MapboxFeaturesProps {
  /** A JSON string for a Plant (Mapbox internally converts all properties into strings) */
  plant: string;
  color: string;
}

const navControlStyle = { right: 10, bottom: 10, zIndex: 10 };
const DEFAULT_VIEWPORT: ViewportProps = {
  zoom: 1,
  width: 'fit',
  height: '100%',
};

export type PlantMapProps = {
  onFullscreen: () => void;
  isFullscreen: boolean;
  plants: Plant[];
  speciesById: SpeciesById;
  colorsBySpeciesId: Record<number, string>;
  reloadData: () => void;
};

function PlantMap(props: PlantMapProps): JSX.Element {
  const classes = useStyles();

  const {onFullscreen, isFullscreen, plants, speciesById, colorsBySpeciesId, reloadData} = props;
  const [selectedPlant, setSelectedPlant] = useState<Plant>();
  const [selectedPlantPhotoUrl, setSelectedPlantPhotoUrl] = useState<string>();
  const [plantModalOpen, setPlantModalOpen] = React.useState(false);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const center = getCenterCoordinates(plants);

  useEffect(() => {
    setViewport({ ...DEFAULT_VIEWPORT, height: '60vh' });
  }, [isFullscreen]);

  useEffect(() => {
    setSelectedPlant((currentlySelected) => {
      return plants.find((plant) => currentlySelected?.featureId === plant.featureId) ?? undefined;
    });
  }, [plants]);

  useEffect(() => {
    const populateSelectedPlantPhoto = async() => {
      if (selectedPlant) {
        const response = await getPlantPhoto(selectedPlant.featureId!);
        setSelectedPlantPhotoUrl(response.photo.imgSrc ?? undefined);
      } else {
        setSelectedPlantPhotoUrl(undefined);
      }
    };

    populateSelectedPlantPhoto();
  }, [selectedPlant]);

  const geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = React.useMemo(() => {
    const plantsWithCoordinates: Plant[] = plants.filter((plant) => plant.coordinates !== undefined);
    const features: GeoJSON.Feature[] = plantsWithCoordinates.map((plant) => {
      const properties: MapboxFeaturesProps = {
        plant: JSON.stringify(plant),
        color: plant.speciesId ? colorsBySpeciesId[plant.speciesId] : 'black',
      };

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          // We just filtered out all plants without coordinates.
          coordinates: [plant.coordinates!.longitude, plant.coordinates!.latitude],
        },
        id: plant.featureId,
        properties,
      };
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [plants, colorsBySpeciesId]);

  const onPlantModalSave = (deleted: boolean) => {
    reloadData();
    setPlantModalOpen(false);
    if (deleted) {
      console.error('BUG!! Plant deletion should not be enabled for the plant dashboard.');
    } else {
      setSnackbar({
        type: 'success',
        msg: strings.SNACKBAR_MSG_CHANGES_SAVED,
      });
    }
  };

  const onUpdatePlant = () => {
    setPlantModalOpen(true);
  };

  const onViewportChange = (newViewport: any) => {
    setViewport({ ...newViewport, width: 'fit' });
  };

  const onClick = (event: MapEvent) => {
    if (!event.features) {
      return;
    }

    if (event.features && event.features.length > 0) {
      const eventFeature = event.features[0];
      const layerId = eventFeature.layer.id;

      if (layerId === 'unclustered-point') {
        if (eventFeature.properties) {
          const properties: MapboxFeaturesProps = eventFeature.properties;
          const plant: Plant = JSON.parse(properties.plant);

          setSelectedPlant(plant);
        }
      }
    }
  };

  return (
    <>
      {selectedPlant && plantModalOpen &&
      <EditPlantModal
            onSave={onPlantModalSave}
            onCancel={() => setPlantModalOpen(false)}
            canDelete={false}
            speciesById={speciesById}
            plant={selectedPlant}
            photoUrl={selectedPlantPhotoUrl}
        />
      }
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
          clusterMaxZoom={8}
        >
          <MapLayers />
        </Source>
        <NavigationControl showCompass={false} style={navControlStyle} />
        <CenterMap center={center} setViewport={setViewport} />
        <div style={{ position: 'absolute', right: 0, bottom: 80 }}>
          <IconButton
            id='full-screen'
            onClick={onFullscreen}
            className={classes.fullscreen}
          >
            <FullscreenIcon />
          </IconButton>
        </div>
        {selectedPlant && (
          <Popup
            onClose={() => {
              setSelectedPlant(undefined);
            }}
            /* Coordinates must be defined otherwise this plant wouldn't be on the map. */
            latitude={selectedPlant.coordinates!.latitude}
            longitude={selectedPlant.coordinates!.longitude}
            captureClick={false}
            closeOnClick={false}
            anchor='top'
          >
            <div>
              <Typography
                component='p'
                variant='subtitle2'
                id='feature-species-name'
              >
                {selectedPlant.speciesId
                  ? speciesById.get(selectedPlant.speciesId)?.name ?? strings.OTHER
                  : strings.OTHER}
              </Typography>
              <Typography
                component='p'
                variant='body2'
                className={classes.spacing}
              >
                {strings.AS_OF} {cellDateFormatter(selectedPlant.enteredTime)}
              </Typography>
              <Typography
                component='p'
                variant='body2'
                className={classes.spacing}
                id='feature-coordinates'
              >
                {selectedPlant.coordinates?.latitude.toFixed(6) ?? 0},
                {selectedPlant.coordinates?.longitude.toFixed(6) ?? 0}
              </Typography>
              <DisplayPhoto photoUrl={selectedPlantPhotoUrl} />
              <Chip
                id='new-species'
                size='medium'
                label={
                  selectedPlant.speciesId
                    ? strings.EDIT_SPECIES
                    : strings.ADD_SPECIES
                }
                onClick={onUpdatePlant}
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

export default memo(PlantMap);

interface CenterMapProps {
  center: { latitude: number; longitude: number };
  setViewport: React.Dispatch<
    React.SetStateAction<{
      zoom: number;
      width: string;
      height: string;
    }>
  >;
}

function CenterMap({ center, setViewport }: CenterMapProps) {
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

  return null;
}

function getCenterCoordinates(plants: Plant[]): { latitude: number; longitude: number } {
  if (plants.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  let maxLat: number = plants[0].coordinates?.latitude ?? 0;
  let minLat = maxLat;
  let maxLong: number = plants[0].coordinates?.longitude ?? 0;
  let minLong = maxLong;

  const plantsCopy = [...plants];
  plantsCopy.shift();

  plantsCopy.forEach((plant) => {
    if (plant.coordinates) {
      const coordinates = plant.coordinates;
      if (coordinates.latitude > maxLat) {
        maxLat = coordinates.latitude;
      }
      if (coordinates.latitude < minLat) {
        minLat = coordinates.latitude;
      }
      if (coordinates.longitude > maxLong) {
        maxLong = coordinates.longitude;
      }
      if (coordinates.longitude < minLong) {
        minLong = coordinates.longitude;
      }
    }
  });

  return {
    latitude: (maxLat + minLat) / 2,
    longitude: (maxLong + minLong) / 2,
  };
}
