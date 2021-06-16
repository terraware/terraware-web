import { useGoogleMap } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MapControlProps = React.PropsWithChildren<{
  position: google.maps.ControlPosition;
}>;

export default function MapControl(props: MapControlProps) {
  const { position, children } = props;

  const map = useGoogleMap();

  const [container] = useState(document.createElement("div"));

  useEffect(() => {
    if (map) map.controls[position].push(container);
  }, [container, map, position]);

  return createPortal(children, container);
}
