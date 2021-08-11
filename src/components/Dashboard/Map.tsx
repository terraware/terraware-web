import { Chip, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Feature } from '../../api/types/feature';
import { Plant } from '../../api/types/plant';
import snackbarAtom from '../../state/atoms/snackbar';
import { photoByFeatureIdSelector } from '../../state/selectors/photos';
import { plantsByFeatureIdSelector } from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesWithGeolocationSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesForChartSelector from '../../state/selectors/speciesForChart';
import strings from '../../strings';
import { cellDateFormatter } from '../common/table/TableCellRenderer';
import NewSpecieModal from './NewSpecieModal';

export type SpecieMap = {
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
};

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
      '&:hover': {
        backgroundColor: theme.palette.common.white,
      },
    },
    spacing: {
      margin: theme.spacing(1, 0),
    },
  })
);

const navControlStyle = {
  right: 10,
  bottom: 10,
};

const DEFAULT_VIEWPORT = { width: '100%', height: '600px', zoom: 8 };

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Props {
  onFullscreen: () => void;
  isFullscreen: boolean;
}

function Map({ onFullscreen, isFullscreen }: Props): JSX.Element {
  const classes = useStyles();
  const [selectedFeature, setSelectedFeature] = React.useState<Feature>();
  const [editPlantModalOpen, setEditPlantModalOpen] = React.useState(false);
  const [viewport, setViewport] = React.useState(DEFAULT_VIEWPORT);

  const features = useRecoilValue(plantsPlantedFeaturesWithGeolocationSelector);
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const photoByFeatureId = useRecoilValue(photoByFeatureIdSelector);
  const plantsByFeatureId = useRecoilValue(plantsByFeatureIdSelector);
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const selectedPlant: Plant | undefined =
    selectedFeature && plantsByFeatureId
      ? plantsByFeatureId[selectedFeature.id!]
      : undefined;

  const selectedPlantForTable =
    selectedPlant && selectedFeature
      ? {
          date: selectedPlant.created_time,
          species: speciesForChart[selectedPlant.species_id!]
            ? speciesForChart[selectedPlant.species_id!].speciesName.name
            : undefined,
          geolocation:
            selectedFeature.geom &&
            Array.isArray(selectedFeature?.geom.coordinates)
              ? `${selectedFeature.geom.coordinates[1].toFixed(
                  6
                )}, ${selectedFeature.geom.coordinates[0].toFixed(6)}`
              : undefined,
          photo: photoByFeatureId
            ? photoByFeatureId[selectedFeature.id!]
            : undefined,
          notes: selectedFeature.notes,
          featureId: selectedFeature.id,
          speciesId: selectedPlant.species_id,
        }
      : undefined;

  React.useEffect(() => {
    setViewport({ ...DEFAULT_VIEWPORT });
  }, [isFullscreen]);

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

  const iconPin = (color: string, feature: Feature) => (
    <svg height='100' width='100' onClick={() => setSelectedFeature(feature)}>
      <circle cx='20' cy='20' r='10' fill={color} />
    </svg>
  );

  const getCoordinates = (feature: Feature): Coordinate => {
    if (
      feature.geom &&
      feature.geom.coordinates &&
      Array.isArray(feature.geom.coordinates)
    ) {
      return {
        longitude: feature.geom.coordinates[0],
        latitude: feature.geom.coordinates[1],
      };
    } else {
      return {
        latitude: 0,
        longitude: 0,
      };
    }
  };

  const getCenter = (): { latitude: number; longitude: number } => {
    if (features?.length) {
      let maxLat: number = getCoordinates(features[0]).latitude;
      let minLat: number = getCoordinates(features[0]).latitude;
      let maxLong: number = getCoordinates(features[0]).longitude;
      let minLong: number = getCoordinates(features[0]).longitude;

      const featureCopy = [...features];
      featureCopy.shift();

      featureCopy.forEach((feature) => {
        const coordinates = getCoordinates(feature);
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
      });

      return {
        latitude: (maxLat + minLat) / 2,
        longitude: (maxLong + minLong) / 2,
      };
    }

    return { latitude: 0, longitude: 0 };
  };

  const center = getCenter();
  const selectedCoordinates = selectedFeature
    ? getCoordinates(selectedFeature)
    : undefined;

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
        onViewportChange={setViewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle='mapbox://styles/mapbox/satellite-v9'
      >
        <NavigationControl showCompass={false} style={navControlStyle} />
        <div style={{ position: 'absolute', right: 0, bottom: 80 }}>
          <IconButton
            id='full-screen'
            onClick={onFullscreen}
            className={classes.fullscreen}
          >
            <FullscreenIcon />
          </IconButton>
        </div>
        {plantsByFeatureId &&
          features?.map((feature) => {
            const plant = plantsByFeatureId[feature.id!];
            const coordinates = getCoordinates(feature);
            if (coordinates && plant) {
              return (
                <Marker
                  key={feature.id}
                  latitude={coordinates.latitude}
                  longitude={coordinates.longitude}
                  offsetLeft={-20}
                  offsetTop={-10}
                >
                  {iconPin(
                    speciesForChart[plant.species_id!]
                      ? speciesForChart[plant.species_id!].color
                      : speciesForChart[0].color,
                    feature
                  )}
                </Marker>
              );
            }

            return null;
          })}
        {selectedFeature && selectedPlant && (
          <Popup
            onClose={() => {
              setSelectedFeature(undefined);
            }}
            latitude={selectedCoordinates ? selectedCoordinates.latitude : 0}
            longitude={selectedCoordinates ? selectedCoordinates.longitude : 0}
            captureClick={false}
            closeOnClick={false}
          >
            <div>
              <Typography
                component='p'
                variant='subtitle2'
                id='feature-species-name'
              >
                {selectedPlant.species_id
                  ? speciesForChart[selectedPlant.species_id].speciesName.name
                  : strings.OTHER}
              </Typography>
              <Typography
                component='p'
                variant='body2'
                className={classes.spacing}
              >
                {strings.AS_OF} {cellDateFormatter(selectedFeature.entered_time)}
              </Typography>
              <Typography
                component='p'
                variant='body2'
                className={classes.spacing}
                id='feature-coordinates'
              >
                {selectedCoordinates
                  ? selectedCoordinates.latitude.toFixed(6)
                  : 0}
                ,
                {selectedCoordinates
                  ? selectedCoordinates.longitude.toFixed(6)
                  : 0}
              </Typography>
              {photoByFeatureId && photoByFeatureId[selectedFeature.id!] && (
                <img
                  alt='Specie'
                  src={photoByFeatureId[selectedFeature.id!]}
                  style={{ maxHeight: '100px', display: 'block' }}
                  id='feature-image'
                />
              )}
              <Chip
                id='new-species'
                size='medium'
                label={
                  selectedPlant.species_id
                    ? strings.EDIT_SPECIES
                    : strings.ADD_SPECIES
                }
                onClick={onNewSpecie}
                className={classes.newSpecies}
                icon={selectedPlant.species_id ? <CreateIcon /> : <AddIcon />}
              />
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </>
  );
}

export default React.memo(Map);
