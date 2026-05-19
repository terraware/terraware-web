import React, { type JSX, type ReactNode } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';

type MapPhotoDrawerProps = {
  children?: ReactNode;
  imageUrl?: string;
  rows: MapDrawerTableRow[];
  tableHeader?: string;
};

const MapPhotoDrawer = ({ children, imageUrl, rows, tableHeader }: MapPhotoDrawerProps): JSX.Element => {
  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'} gap={children ? 2 : 0}>
      {imageUrl && <img src={`${imageUrl}?maxWidth=377`} />}
      <MapDrawerTable header={tableHeader} rows={rows} />
      {children}
    </Box>
  );
};

export default MapPhotoDrawer;
