import { Chip, IconButton, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import CreateIcon from "@material-ui/icons/Create";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useState } from "react";
import * as speciesData from "../../data/species.json";
import CustomMapControl from "./CustomMapControl";
import NewSpecieModal from "./NewSpecieModal";

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
      width: "100%",
      background: "transparent",
      border: "1px solid",

      "&:focus": {
        background: "transparent",
      },
    },
    fullscreen: {
      background: theme.palette.common.white,
      borderRadius: 0,
      padding: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
      "&:hover": {
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
  const [selectedSpecie, setSelectedSpecie] = useState<SpecieMap>();

  const [editSpecieModalOpen, setEditSpecieModalOpen] = React.useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_KEY ||
      "AIzaSyD2fuvCA8pud6zvJxmzWpSmsImAD3uhfUE",
  });

  const [, setMap] = React.useState(null);

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onCloseEditSpecieModal = () => {
    setEditSpecieModalOpen(false);
  };

  const onNewSpecie = () => {
    setEditSpecieModalOpen(true);
  };

  const iconPin = (color?: string) => {
    return {
      path: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z",
      fillColor: color,
      fillOpacity: 1,
      scale: 0.05, //to reduce the size of icons
    };
  };

  const onFullscreenClick = () => {
    setIsFullscreen(!isFullscreen);
    onFullscreen();
  };

  return (
    <>
      <NewSpecieModal
        open={editSpecieModalOpen}
        onClose={onCloseEditSpecieModal}
        value={selectedSpecie}
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
          mapTypeId="satellite"
          mapContainerStyle={
            isFullscreen
              ? { width: "100%", height: "600px" }
              : { width: "100%", height: "100%" }
          }
        >
          <CustomMapControl
            position={window.google.maps.ControlPosition.RIGHT_BOTTOM}
          >
            <IconButton
              id="full-screen"
              onClick={onFullscreenClick}
              className={classes.fullscreen}
            >
              <FullscreenIcon />
            </IconButton>
          </CustomMapControl>
          {speciesData.features.map((specie) => (
            <Marker
              key={specie.properties.SPECIE_ID}
              position={{
                lat: specie.geometry.coordinates[1],
                lng: specie.geometry.coordinates[0],
              }}
              onClick={(e) => {
                setSelectedSpecie(specie);
              }}
              options={{ icon: iconPin(specie.properties.COLOR) }}
            />
          ))}

          {selectedSpecie && (
            <InfoWindow
              onCloseClick={() => {
                setSelectedSpecie(undefined);
              }}
              position={{
                lat: selectedSpecie.geometry.coordinates[1],
                lng: selectedSpecie.geometry.coordinates[0],
              }}
            >
              <div>
                <Typography component="p" variant="subtitle2">
                  {selectedSpecie.properties.NAME}
                </Typography>
                <Typography
                  component="p"
                  variant="body2"
                  className={classes.spacing}
                >
                  As of {selectedSpecie.properties.DATE}
                </Typography>
                <Typography
                  component="p"
                  variant="body2"
                  className={classes.spacing}
                >
                  {selectedSpecie.geometry.coordinates[1].toFixed(6)},
                  {selectedSpecie.geometry.coordinates[0].toFixed(6)}
                </Typography>
                <img
                  alt="Specie"
                  src={selectedSpecie.properties.IMG}
                  style={{ maxHeight: "100px", display: "block" }}
                />
                <Chip
                  id="new-species"
                  size="medium"
                  label={
                    selectedSpecie.properties.NAME !== "Other"
                      ? "Edit Species"
                      : "Add Species"
                  }
                  onClick={onNewSpecie}
                  className={classes.newSpecies}
                  icon={
                    selectedSpecie.properties.NAME !== "Other" ? (
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
