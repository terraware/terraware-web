import { Chip, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { useRecoilValue } from 'recoil';
import { Feature } from '../../api/types/feature';
import { Plant } from '../../api/types/plant';
import { photoByFeatureIdSelector } from '../../state/selectors/photos';
import { plantsByFeatureIdSelector } from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesForChartSelector from '../../state/selectors/speciesForChart';
import strings from '../../strings';
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

interface Props {
  onFullscreen: () => void;
  isFullscreen: boolean;
}

function Map({ onFullscreen, isFullscreen }: Props): JSX.Element {
  const classes = useStyles();
  const [selectedFeature, setSelectedFeature] = useState<Feature>();
  const [editPlantModalOpen, setEditPlantModalOpen] = React.useState(false);

  const features = useRecoilValue(plantsPlantedFeaturesSelector);
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const photoByFeatureId = useRecoilValue(photoByFeatureIdSelector);
  const plantsByFeatureId = useRecoilValue(plantsByFeatureIdSelector);

  const [viewport, setViewport] = React.useState({
    width: '100%',
    height: '600px',
    zoom: 8,
  });

  useEffect(() => {
    setViewport({ width: '100%', height: '600px', zoom: 8 });
  }, [isFullscreen]);

  const onCloseEditPlantModal = () => {
    setEditPlantModalOpen(false);
  };

  const onNewSpecie = () => {
    setEditPlantModalOpen(true);
  };

  const iconPin = (color: string, feature: Feature) => (
    <svg height='100' width='100' onClick={() => setSelectedFeature(feature)}>
      <circle cx='20' cy='20' r='10' fill={color} />
    </svg>
  );

  const onFullscreenClick = () => {
    onFullscreen();
  };

  const getCoordinates = (feature: Feature): number[] => {
    return feature.geom &&
      feature.geom.coordinates &&
      Array.isArray(feature.geom.coordinates)
      ? feature.geom.coordinates
      : [];
  };

  const getCenter = (): { latitude: number; longitude: number } => {
    if (features?.length) {
      let maxLat: number = getCoordinates(features[0])[1];
      let minLat: number = getCoordinates(features[0])[1];
      let maxLong: number = getCoordinates(features[0])[0];
      let minLong: number = getCoordinates(features[0])[0];

      const featureCopy = [...features];
      featureCopy.shift();

      featureCopy.forEach((feature) => {
        const coordinates = getCoordinates(feature);
        if (coordinates[1] > maxLat) {
          maxLat = coordinates[1];
        }
        if (coordinates[1] < minLat) {
          minLat = coordinates[1];
        }
        if (coordinates[0] > maxLong) {
          maxLong = coordinates[0];
        }
        if (coordinates[0] < minLong) {
          minLong = coordinates[0];
        }
      });

      return {
        latitude: (maxLat + minLat) / 2,
        longitude: (maxLong + minLong) / 2,
      };
    }

    return { latitude: 0, longitude: 0 };
  };

  const selectedPlant: Plant | undefined =
    selectedFeature && plantsByFeatureId
      ? plantsByFeatureId[selectedFeature.id!]
      : undefined;

  return (
    <>
      <NewSpecieModal
        open={editPlantModalOpen}
        onClose={onCloseEditPlantModal}
        value={selectedPlant}
      />
      <ReactMapGL
        latitude={getCenter().latitude}
        longitude={getCenter().longitude}
        {...viewport}
        onViewportChange={setViewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle='mapbox://styles/mapbox/satellite-v9'
      >
        <div style={{ position: 'absolute', right: 20, bottom: 20 }}>
          <IconButton
            id='full-screen'
            onClick={onFullscreenClick}
            className={classes.fullscreen}
          >
            <FullscreenIcon />
          </IconButton>
        </div>
        {plantsByFeatureId &&
          features?.map((feature) => {
            const plant = plantsByFeatureId[feature.id!];
            const coordinates = getCoordinates(feature);
            if (coordinates.length) {
              return (
                <Marker
                  key={feature.id}
                  latitude={coordinates[1]}
                  longitude={coordinates[0]}
                  offsetLeft={-20}
                  offsetTop={-10}
                >
                  {iconPin(speciesForChart[plant.species_id!].color, feature)}
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
            latitude={getCoordinates(selectedFeature)[1]}
            longitude={getCoordinates(selectedFeature)[0]}
            captureClick={false}
            closeOnClick={false}
          >
            <div>
              <Typography component='p' variant='subtitle2'>
                {speciesForChart[selectedPlant.species_id!].speciesName.name}
              </Typography>
              <Typography
                component='p'
                variant='body2'
                className={classes.spacing}
              >
                {strings.AS_OF} {selectedPlant.date_planted}
              </Typography>
              <Typography
                component='p'
                variant='body2'
                className={classes.spacing}
              >
                {getCoordinates(selectedFeature)[1].toFixed(6)},
                {getCoordinates(selectedFeature)[0].toFixed(6)}
              </Typography>
              {photoByFeatureId && photoByFeatureId[selectedFeature.id!] && (
                <img
                  alt='Specie'
                  src={photoByFeatureId[selectedFeature.id!]}
                  style={{ maxHeight: '100px', display: 'block' }}
                />
              )}
              <Chip
                id='new-species'
                size='medium'
                label={
                  speciesForChart[selectedPlant.species_id!].speciesName
                    .name !== strings.OTHER
                    ? strings.EDIT_SPECIES
                    : strings.ADD_SPECIES
                }
                onClick={onNewSpecie}
                className={classes.newSpecies}
                icon={
                  speciesForChart[selectedPlant.species_id!].speciesName
                    .name !== strings.OTHER ? (
                    <CreateIcon />
                  ) : (
                    <AddIcon />
                  )
                }
              />
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </>
  );
}

export default React.memo(Map);
