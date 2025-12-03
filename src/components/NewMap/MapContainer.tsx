import React, { CSSProperties, ReactNode, useMemo } from 'react';

import { useDeviceInfo } from '@terraware/web-components/utils';

import './styles.scss';

export type MapContainerProps = {
  containerId?: string;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  hideBorder?: boolean;
  legend?: ReactNode;
  map: ReactNode;
  style?: CSSProperties;
};

const MapContainer = (props: MapContainerProps) => {
  const { containerId, drawer, drawerOpen, hideBorder, legend, map, style } = props;
  const { isDesktop } = useDeviceInfo();
  const drawerOnly = useMemo(() => !isDesktop && drawerOpen, [drawerOpen, isDesktop]);

  return (
    <div
      id={containerId}
      className={`map-container map-container${
        isDesktop ? '--desktop' : `--mobile${drawerOpen ? '-drawer-open' : ''}`
      }`}
      style={{ ...style, ...(hideBorder ? { border: 'none' } : undefined) }}
    >
      <div className={`map-holder${drawerOnly ? ' map-holder--hidden' : ''}`}>{map}</div>
      {drawerOpen && drawer}
      {!drawerOnly && legend}
    </div>
  );
};

export default MapContainer;
