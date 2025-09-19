import React, { ReactNode, useMemo } from 'react';

import { useDeviceInfo } from '@terraware/web-components/utils';

import './styles.scss';

type MapContainerProps = {
  containerId?: string;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  legend?: ReactNode;
  map: ReactNode;
};

const MapContainer = (props: MapContainerProps) => {
  const { containerId, drawer, drawerOpen, legend, map } = props;
  const { isDesktop } = useDeviceInfo();
  const drawerOnly = useMemo(() => !isDesktop && drawerOpen, [drawerOpen, isDesktop]);

  return (
    <div
      id={containerId}
      className={`map-container map-container${
        isDesktop ? '--desktop' : `--mobile${drawerOpen ? '-drawer-open' : ''}`
      }`}
    >
      <div className={`map-holder${drawerOnly ? ' map-holder--hidden' : ''}`}>{map}</div>
      {drawerOpen && drawer}
      {!drawerOnly && legend}
    </div>
  );
};

export default MapContainer;
