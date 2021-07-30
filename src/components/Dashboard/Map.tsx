import { Chip, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Feature } from '../../api/types/feature';
import { Plant } from '../../api/types/plant';
import { photoByFeatureIdSelector } from '../../state/selectors/photos';
import plantsPlanted from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesForChartSelector from '../../state/selectors/speciesForChart';
import CustomMapControl from './CustomMapControl';
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
}

function Map({ onFullscreen }: Props): JSX.Element {
  const classes = useStyles();
  const [selectedFeature, setSelectedFeature] = useState<Feature>();

  const [editPlantModalOpen, setEditPlantModalOpen] = React.useState(false);

  const features = useRecoilValue(plantsPlantedFeaturesSelector);
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const plants = useRecoilValue(plantsPlanted);

  const photoByFeatureId = useRecoilValue(photoByFeatureIdSelector);

  const plantsByFeatureId: Record<number, Plant> = {};
  plants?.forEach((plant) => {
    plantsByFeatureId[plant.feature_id] = plant;
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_KEY ||
      'AIzaSyD2fuvCA8pud6zvJxmzWpSmsImAD3uhfUE',
  });

  const [, setMap] = React.useState(null);

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const onLoad = React.useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback((map) => {
    setMap(null);
  }, []);

  const onCloseEditPlantModal = () => {
    setEditPlantModalOpen(false);
  };

  const onNewSpecie = () => {
    setEditPlantModalOpen(true);
  };

  const iconPin = (color?: string) => {
    return {
      path: 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z',
      fillColor: color,
      fillOpacity: 1,
      scale: 0.05, // to reduce the size of icons
    };
  };

  const onFullscreenClick = () => {
    setIsFullscreen(!isFullscreen);
    onFullscreen();
  };

  const selectedPlant: Plant | undefined = selectedFeature
    ? plantsByFeatureId[selectedFeature.id!]
    : undefined;

  return (
    <>
      <NewSpecieModal
        open={editPlantModalOpen}
        onClose={onCloseEditPlantModal}
        value={selectedPlant}
      />

      {isLoaded ? (
        <GoogleMap
          zoom={10}
          center={{ lat: 45.4211, lng: -75.6903 }}
          onLoad={onLoad}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
          }}
          onUnmount={onUnmount}
          mapTypeId='satellite'
          mapContainerStyle={
            isFullscreen
              ? { width: '100%', height: '600px' }
              : { width: '100%', height: '100%' }
          }
        >
          <CustomMapControl
            position={window.google.maps.ControlPosition.RIGHT_BOTTOM}
          >
            <IconButton
              id='full-screen'
              onClick={onFullscreenClick}
              className={classes.fullscreen}
            >
              <FullscreenIcon />
            </IconButton>
          </CustomMapControl>
          {features?.map((feature) => {
            const plant = plantsByFeatureId[feature.id!];

            const coordinates: number[] =
              feature.geom &&
              feature.geom.coordinates &&
              Array.isArray(feature.geom?.coordinates)
                ? feature.geom?.coordinates
                : [];
            if (coordinates.length) {
              return (
                <Marker
                  key={feature.id}
                  position={{
                    lat: coordinates[1],
                    lng: coordinates[0],
                  }}
                  options={{
                    icon: iconPin(speciesForChart[plant.species_id!].color),
                  }}
                  onClick={() => setSelectedFeature(feature)}
                />
              );
            }

            return null;
          })}

          {selectedFeature && selectedPlant && (
            <InfoWindow
              onCloseClick={() => {
                setSelectedFeature(undefined);
              }}
              position={{
                lat:
                  typeof selectedFeature.geom?.coordinates === 'object' &&
                  Array.isArray(selectedFeature.geom?.coordinates)
                    ? selectedFeature.geom.coordinates[1]
                    : 0,
                lng:
                  typeof selectedFeature.geom?.coordinates === 'object' &&
                  Array.isArray(selectedFeature.geom?.coordinates)
                    ? selectedFeature.geom.coordinates[0]
                    : 0,
              }}
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
                  As of {selectedPlant.date_planted}
                </Typography>
                <Typography
                  component='p'
                  variant='body2'
                  className={classes.spacing}
                >
                  {typeof selectedFeature.geom?.coordinates === 'object' &&
                  Array.isArray(selectedFeature.geom?.coordinates)
                    ? selectedFeature.geom.coordinates[1].toFixed(6)
                    : 0}
                  ,
                  {typeof selectedFeature.geom?.coordinates === 'object' &&
                  Array.isArray(selectedFeature.geom?.coordinates)
                    ? selectedFeature.geom.coordinates[0].toFixed(6)
                    : 0}
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
                      .name !== 'Other'
                      ? 'Edit Species'
                      : 'Add Species'
                  }
                  onClick={onNewSpecie}
                  className={classes.newSpecies}
                  icon={
                    speciesForChart[selectedPlant.species_id!].speciesName
                      .name !== 'Other' ? (
                      <CreateIcon />
                    ) : (
                      <AddIcon />
                    )
                  }
                />
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <>Test</>
      )}
    </>
  );
}

export default React.memo(Map);
