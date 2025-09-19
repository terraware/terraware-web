import React from 'react';

import { Box } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import useMapboxToken from 'src/utils/useMapboxToken';

type MapSplitViewProps = {
  children: React.ReactNode;
  topComponent?: React.ReactNode;
};

export default function MapSplitView({ children, topComponent }: MapSplitViewProps): JSX.Element {
  const { token, mapId } = useMapboxToken();

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <MapComponent
        drawerChildren={children}
        drawerHideHeader
        drawerOpen
        drawerSize='large'
        mapId={mapId}
        token={token ?? ''}
      />
    </Box>
  );
}
