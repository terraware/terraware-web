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
import { plantsByFeatureIdSelector } from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import speciesForChartSelector from '../../state/selectors/speciesForChart';
import strings from '../../strings';
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
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const features = useRecoilValue(plantsPlantedFeaturesSelector);
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const photoByFeatureId = useRecoilValue(photoByFeatureIdSelector);
  const plantsByFeatureId = useRecoilValue(plantsByFeatureIdSelector);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: `${process.env.REACT_APP_GOOGLE_KEY}`,
  });

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

  const getCoordinates = (feature: Feature): number[] => {
    return feature.geom &&
      feature.geom.coordinates &&
      Array.isArray(feature.geom.coordinates)
      ? feature.geom.coordinates
      : [];
  };

  const getCenter = () => {
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

      return { lat: (maxLat + minLat) / 2, lng: (maxLong + minLong) / 2 };
    }

    return { lat: 0, lng: 0 };
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

      {isLoaded ? (
        <GoogleMap
          zoom={9}
          center={getCenter()}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
          }}
          mapTypeId='satellite'
          mapContainerStyle={
            isFullscreen
              ? { width: '100%', height: '600px' }
              : { width: '100%', height: '100%' }
          }
        >
          <CustomMapControl position={9}>
            <IconButton
              id='full-screen'
              onClick={onFullscreenClick}
              className={classes.fullscreen}
            >
              <FullscreenIcon />
            </IconButton>
          </CustomMapControl>
          {plantsByFeatureId &&
            features?.map((feature) => {
              const plant = plantsByFeatureId[feature.id!];

              const coordinates = getCoordinates(feature);

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
                lat: getCoordinates(selectedFeature)[1],
                lng: getCoordinates(selectedFeature)[0],
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
