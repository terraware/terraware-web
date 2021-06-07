import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useState } from "react";
import * as speciesData from "../data/species.json";

export type SpecieMap = {
  geometry: {
    coordinates: number[];
  };
  properties: {
    SPECIE_ID: number;
    NAME: string;
  };
};

function Map() {
  const [selectedSpecie, setSelectedSpecie] = useState<SpecieMap>();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY || "tokyo-rider-300113",
  });

  const [, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap zoom={10} center={{ lat: 45.4211, lng: -75.6903 }}>
      {speciesData.features.map((specie) => (
        <Marker
          key={specie.properties.SPECIE_ID}
          position={{
            lat: specie.geometry.coordinates[1],
            lng: specie.geometry.coordinates[0],
          }}
          onClick={() => {
            setSelectedSpecie(specie);
          }}
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
            <h2>{selectedSpecie.properties.NAME}</h2>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(Map);
